var grammar = require('./grammar');
var semantics = require('./semantics');
var ParseError = require('./ParseError');
module.exports = text => {
	var matchResult = grammar.match(text);
	if (matchResult.failed()) throw new ParseError(matchResult);
	return semantics(matchResult).parse();
}
