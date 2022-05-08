import 'google-apps-script';

// 環境変数
const TWITTER_API_KEY = PropertiesService.getScriptProperties().getProperty('TWITTER_API_KEY') || '';
const TWITTER_API_SECRET_KEY = PropertiesService.getScriptProperties().getProperty('TWITTER_API_SECRET_KEY') || '';
const TWITTER_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('TWITTER_ACCESS_TOKEN') || '';
const TWITTER_ACCESS_SECRET_TOKEN = PropertiesService.getScriptProperties().getProperty('TWITTER_ACCESS_SECRET_TOKEN') || '';
const SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '';

const logSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('logs');
const logMaxRow = 1000;

// ログ
function log(level: 'info' | 'warn' | 'error', message: string) {
	switch(level) {
		case 'info':
			console.log(message);
			break;
		case 'warn':
			console.warn(message);
			break;
		case 'error':
			console.error(message);
			break;
	}

	if (!logSheet) {
		console.error('logSheet not found.');
		return;
	}

	logSheet.appendRow([new Date(), level.toUpperCase(), message]);

	if (logMaxRow < logSheet.getLastRow()) {
		logSheet.deleteRow(2);
	}
}

// モデル
class Follower {
	constructor(
		readonly twitterId: string,
		readonly date: string,
		readonly screenName: string,
		readonly name: string,
	) { }

	static fromRow(row: string[]) {
		return new Follower(row[0], row[1], row[2], row[3]);
	}

	toRow(): string[] {
		return [this.twitterId, this.date, this.screenName, this.name];
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
				log('error', `faced to rate limit. wait for ${ waitTimeMilliSeconds } ms.`);
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

			log('info', `begin fetch followers of ID ${id}`);

			try {
				const followers = fetchFollowersById(twitterClient, id, date);
				writeFollowers(id, followers);

				log('info', `finish fetch followers of ID ${id}`);
			} catch (e) {
				log('error', `failed to fetch followers of ID ${id}: ${e}`);
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



//// API ////

type GetFollowerDiffItem = {
	twitterId: string,
	diff: '+' | '-'
	screenName: string,
	name: string,
}

function getFollowerDiff(id: string, from: string, to: string): GetFollowerDiffItem[] {
	// query 関数に結果を格納するためのシートを作る
	const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(`followers_${id}`);

	if (!sheet) {
		throw Error(`sheet followers_${id} not found`);
	}

	const fromFollowers = getFollowersAt(sheet, from);
	const toFollowers = getFollowersAt(sheet, to);

	const fromFollowerIds = new Set(fromFollowers.map(follower => follower.twitterId));
	const toFollowerIds = new Set(toFollowers.map(follower => follower.twitterId));

	const result: GetFollowerDiffItem[] = [];

	toFollowers.forEach(follower => {
		if(!fromFollowerIds.has(follower.twitterId)) {
			result.push({
				twitterId: follower.twitterId,
				diff: '+',
				screenName: follower.screenName,
				name: follower.name
			})
		}
	});

	fromFollowers.forEach(follower => {
		if(!toFollowerIds.has(follower.twitterId)) {
			result.push({
				twitterId: follower.twitterId,
				diff: '-',
				screenName: follower.screenName,
				name: follower.name
			})
		}
	});

	return result;
}

function getFollowersAt(sheet: GoogleAppsScript.Spreadsheet.Sheet, date: string): Follower[] {
	let minIndex = 2;
	let maxIndex = sheet.getLastRow();
	let found = false;

	while (minIndex < maxIndex) {
		const c = minIndex + (maxIndex - minIndex) / 2;
		const d = sheet.getRange(c, 2).getDisplayValue();

		if (d < date) {
			minIndex = c + 1;
		} else if (d === date) {
			maxIndex = c;
			found = true;
		} else {
			maxIndex = c - 1;
		}
	}

	let result: Follower[] = [];

	if (found) {
		const rangeMinIndex = minIndex;
		minIndex = 2;
		maxIndex = sheet.getLastRow();
		found = false;

		while (minIndex < maxIndex) {
			const c = minIndex + (maxIndex - minIndex) / 2;
			const d = sheet.getRange(c, 2).getDisplayValue();

			if (d < date) {
				minIndex = c + 1;
			} else if (d === date) {
				minIndex = c;
				found = true;
			} else {
				maxIndex = c - 1;
			}
		}

		const rangeMaxIndex = minIndex;

		const rows = sheet.getRange(rangeMinIndex, 1, rangeMaxIndex - rangeMinIndex + 1, 4).getDisplayValues();
		result = rows.map(row => Follower.fromRow(row));
	}

	return result;
}


type getFollowerDiffRequestParams = {
	id: string,
	from: string,
	to: string
}

function validateGetFollowerDiffParams(params: Record<string, string>): params is getFollowerDiffRequestParams {
	if (!params['id']) {
		throw Error('id is required.');
	} else {
		if (!params['id'].match(/^\d+$/)) {
			throw Error('id is invalid.');
		}
	}

	if (!params['from']) {
		throw Error('from is required.');
	} else {
		if (!params['from'].match(/^\d{4}-\d{2}-\d{2}$/)) {
			throw Error('from is invalid.');
		}
	}

	if (!params['to']) {
		throw Error('to is required.');
	} else {
		if (!params['to'].match(/^\d{4}-\d{2}-\d{2}$/)) {
			throw Error('from is invalid.');
		}
	}

	return true;
}

function execGetFollowerDiffApi(params: Record<string, string>) {
	try {
		if (validateGetFollowerDiffParams(params)) {
			const followers = getFollowerDiff(params['id'], params['from'], params['to']);


			return ({
				status: 200,
				resultCode: '00101',
				list: followers
			})
		}

		throw Error('unknown error');
	} catch(e) {
		if (e instanceof Error) {
			return ({
				status: 500,
				message: e.message
			})
		}
	}
}

type Request = {
	queryString: string | null,
	pathInfo: string,
	parameter: Record<string, any>,
	parameters: Record<string, any>,
}

function doGet(request: Request) {
	const jobUuid = Utilities.getUuid();
	const path = request.pathInfo;

	log('info', `[${ jobUuid }] GET ${ path }: begin.`);

	let result = null;

	switch(path) {
		case 'followers/diff': {
			result = execGetFollowerDiffApi(request.parameter);
			break;
		}
		default: {
			result = ({
				status: 404
			});
			break;
		}
	}

	if (result?.status) {
		if (result.status === 200) {
			log('info', `[${ jobUuid }] GET ${ path }: finished with status 200.`);
		} else if (result.status < 500) {
			log('info', `[${ jobUuid }] GET ${ path }: finished with status ${ result.status }.`);
		} else {
			log('error', `[${ jobUuid }] GET ${ path }: finished with status ${ result.status }. response: ${ JSON.stringify(result) }`);
		}
	}

	return ContentService.createTextOutput(JSON.stringify(result))
		.setMimeType(ContentService.MimeType.JSON);
}