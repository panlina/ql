var grammar = require('./grammar');
var Expression = require('./Expression');
var semantics = grammar.createSemantics().addOperation('parse', {
	number: x => +x.sourceString,
	string: (open, x, close) => x.sourceString,
	identifier: (_, x) => x.sourceString,
	ExpressionName: identifier => new Expression.Name(identifier.parse()),
	ExpressionAtom: _default,
	ExpressionAtom_parentheses: (open, expression, close) => expression.parse(),
	ExpressionAdd: _default,
	ExpressionAdd_add: binary,
	ExpressionCompare: _default,
	ExpressionCompare_compare: binary,
	ExpressionNot: _default,
	ExpressionNot_not: unary,
	ExpressionAnd: _default,
	ExpressionAnd_and: binary,
	ExpressionOr: _default,
	ExpressionOr_or: binary,
	ExpressionFilter: _default,
	ExpressionFilter_filter: (expression, bar, filter) => new Expression.Filter(
		expression.parse(),
		filter.parse()
	),
	Expression: _default
});
function _default(expression) { return expression.parse(); }
function binary(left, operator, right) {
	return new Expression.Binary(
		operator.sourceString,
		left.parse(),
		right.parse()
	);
}
function unary(operator, operand) {
	return new Expression.Unary(
		operator.sourceString,
		operand.parse()
	);
}
module.exports = semantics;
