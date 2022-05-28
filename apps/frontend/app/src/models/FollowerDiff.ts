export type DiffType = '+' | '-';

export class FollowerDiff {
  constructor(
    public readonly twitterId: string,
    public readonly diff: DiffType,
    public readonly screenName: string,
    public readonly name: string
  ) { }
}