var grammar = require('./grammar');
var Expression = require('./Expression');
var semantics = grammar.createSemantics().addOperation('parse', {
	identifier: x => x.sourceString,
	ExpressionName: identifier => new Expression.Name(identifier.parse()),
	ExpressionAtom: expression => expression.parse(),
	ExpressionAtom_parentheses: (open, expression, close) => expression.parse(),
	ExpressionFilter: expression => expression.parse(),
	ExpressionFilter_filter: (expression, bar, filter) => new Expression.Filter(
		expression.parse(),
		filter.parse()
	),
	Expression: expression => expression.parse()
});
module.exports = semantics;
