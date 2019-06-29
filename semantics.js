var grammar = require('./grammar');
var Expression = require('./Expression');
var semantics = grammar.createSemantics().addOperation('parse', {
	identifier: x => x.sourceString,
	ExpressionName: identifier => new Expression.Name(identifier.parse()),
	Expression: expression => expression.parse()
});
module.exports = semantics;
