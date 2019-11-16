class ParseError extends Error {
	constructor(matchResult) {
		super();
		this.matchResult = matchResult;
	}
	get message() { return this.matchResult.message; }
}
module.exports = ParseError;
