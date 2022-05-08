import 'google-apps-script'

// 環境変数
const TWITTER_API_KEY = PropertiesService.getScriptProperties().getProperty('TWITTER_API_KEY') || '';
const TWITTER_API_SECRET_KEY = PropertiesService.getScriptProperties().getProperty('TWITTER_API_SECRET_KEY') || '';
const TWITTER_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('TWITTER_ACCESS_TOKEN') || '';
const TWITTER_ACCESS_SECRET_TOKEN = PropertiesService.getScriptProperties().getProperty('TWITTER_ACCESS_SECRET_TOKEN') || '';
const SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '';

// モデル
class Follower {
	constructor(
		readonly twitterId: string,
		readonly date: string,
		readonly screenName: string,
		readonly name: string,
	) { }

	static fromRow(row: string[]) {
		new Follower(row[0], row[1], row[2], row[3])
	}

	toRow(): string[] {
		return [this.twitterId, this.date, this.screenName, this.name]
	}
}

// TwitterApi
type TwitterApiUser = {
	id: string,
	name: string,
	username: string,
	url: string,
}

type TwitterApiGetFollowersResponse = {
	data: TwitterApiUser[],
	meta?: {
		resultCount: number,
		nextToken: string | undefined
	}
}

class TwitterClient {
	readonly bearerTokens: Record<string, string>

	constructor(
		readonly apiKey: string,
		readonly apiSecretKey: string,
		readonly accessToken: string,
		readonly accessSecretToken: string,
	) {
		const base64Token = Utilities.base64Encode(`${apiKey}:${apiSecretKey}`);
		const oauth2Response = UrlFetchApp.fetch(
			'https://api.twitter.com/oauth2/token',
			{
				method: 'post',
				contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
				headers: {
					'Authorization': `Basic ${base64Token}`
				},
				payload: {
					'grant_type': 'client_credentials'
				}
			}
		);

		this.bearerTokens = JSON.parse(oauth2Response.getContentText());
	}

	get_followers(id: string): TwitterApiUser[] {
		let paginationToken: string | null = null;
		let followers: TwitterApiUser[] = [];

		do {
			const response: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(
				`https://api.twitter.com/2/users/${id}/followers?max_results=500${ paginationToken ? `&pagination_token=${paginationToken}` : ''}`,
				{
					headers: {
						'Authorization': 'Bearer ' + this.bearerTokens.access_token
					},
					muteHttpExceptions: true
				}
			);

			if (response.getResponseCode() === 429) {
				// レートリミットは解除されるまで待つ
				const responseHeaders: { 'x-rate-limit-reset'?: string } = response.getAllHeaders();
				const rateLimitResetAt = responseHeaders['x-rate-limit-reset'];

				if (!rateLimitResetAt) {
					throw Error('x-rate-limit-reset is not set');
				}

				// 余裕を持って1秒ほど余分に待つ
				const waitTimeMilliSeconds = Number(rateLimitResetAt) * 1000 - Date.now() + 1000;
				console.log(`faced to rate limit. wait for ${ waitTimeMilliSeconds } ms.`);
				Utilities.sleep(waitTimeMilliSeconds);
				continue;
			} else if (response.getResponseCode() !== 200) {
				throw Error(response.getContentText());
			}

			const resObj: TwitterApiGetFollowersResponse = JSON.parse(response.getContentText());

			followers = followers.concat(resObj.data);

			if (resObj.meta?.nextToken) {
				paginationToken = resObj.meta?.nextToken;
			} else {
				paginationToken = null;
			}
		} while (paginationToken);

		return followers;
	}
}

/******** バッチ処理 ********/
function setTrigger() {
	// 毎日0時に実行
	ScriptApp.newTrigger('fetchFollowers').timeBased().atHour(0).everyDays(1).create();
}

async function fetchFollowers() {
	const now = new Date();
	const date = `${ now.getFullYear().toString().padStart(4, '0') }-${ (now.getMonth() + 1).toString().padStart(2, '0') }-${ now.getDate().toString().padStart(2, '0') }`;

	const twitterClient = new TwitterClient(
		TWITTER_API_KEY,
		TWITTER_API_SECRET_KEY,
		TWITTER_ACCESS_TOKEN,
		TWITTER_ACCESS_SECRET_TOKEN
	);

	SpreadsheetApp.openById(SHEET_ID).getSheets().forEach(async sheet => {

		const matched = sheet.getName().match(/followers_(.+)?/);

		if (matched) {
			const id = matched[1];

			console.log(`begin fetch followers of ID ${id}`);

			try {
				const followers = fetchFollowersById(twitterClient, id, date);
				writeFollowers(id, followers);

				console.log(`finish fetch followers of ID ${id}`);
			} catch (e) {
				console.log(`failed to fetch followers of ID ${id}: ${e}`);
			}
		}
	});
}



function fetchFollowersById(twitterClient: TwitterClient, id: string, date: string) {
	const followers = twitterClient.get_followers(id);

	return followers.map(user => (new Follower(
		user.id,
		date,
		user.username,
		user.name
	)))
}

function writeFollowers(id: string, followers: Follower[]) {
	const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(`followers_${id}`);

	if (!sheet) {
		throw Error(`sheet followers_${id} not found`);
	}
	const appendRows = followers.map(follower => follower.toRow());

	if (appendRows.length > 0) {
		const lastRow = sheet.getLastRow();
		sheet.getRange(lastRow + 1, 1, appendRows.length, appendRows[0].length).setValues(appendRows);
	}
}