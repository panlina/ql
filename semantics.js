var grammar = require('./grammar');
var Expression = require('./Expression');
var semantics = grammar.createSemantics().addOperation('parse', {
	number: x => new Expression.Literal(+x.sourceString),
	string: (open, x, close) => new Expression.Literal(x.sourceString),
	identifier: (_, x) => x.sourceString,
	ExpressionName: (global, identifier) => new Expression.Name(identifier.parse(), global.sourceString ? Infinity : null),
	ExpressionThis: (_this, identifier) => new Expression.This(identifier.parse()),
	ExpressionAtom: _default,
	ExpressionAtom_parentheses: (open, expression, close) => expression.parse(),
	ExpressionMember: _default,
	ExpressionMember_property: (expression, dot, property) => new Expression.Property(expression.parse(), property.parse()),
	ExpressionMember_index: (expression, sharp, index) => new Expression.Index(expression.parse(), index.parse()),
	ExpressionCount_count: (expression, sharp) => new Expression.Operation('#', expression.parse(), undefined),
	ExpressionAdd: _default,
	ExpressionAdd_add: binary,
	ExpressionMultiply: _default,
	ExpressionMultiply_multiply: binary,
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
	ExpressionComma: _default,
	ExpressionComma_comma: (name, equal, value, comma, body) => new Expression.Comma(
		{
			name: name.parse(),
			value: value.parse()
		},
		body.parse()
	),
	Expression: _default
});
function _default(expression) { return expression.parse(); }
function binary(left, operator, right) {
	return new Expression.Operation(
		operator.sourceString,
		left.parse(),
		right.parse()
	);
}
function unary(operator, operand) {
	if (operator.isTerminal())
		return new Expression.Operation(
			operator.sourceString,
			undefined,
			operand.parse()
		);
	else {
		[operator, operand] = [operand, operator];
		return new Expression.Operation(
			operator.sourceString,
			operand.parse(),
			undefined
		);
	}
}
module.exports = semantics;
