var grammar = require('./grammar');
var Expression = require('./Expression');
var Declaration = require('./Declaration');
var semantics = grammar.createSemantics().addOperation('parse', {
	number: x => new Expression.Literal(+x.sourceString),
	string: (open, x, close) => new Expression.Literal(x.children.map(char => char.parse()).join('')),
	char_literal: x => x.sourceString,
	char_escaped: (backslash, x) => escape[x.sourceString],
	identifier: (_, x) => x.sourceString,
	ExpressionName: (global, identifier) => new Expression.Name(identifier.parse(), global.sourceString ? Infinity : null),
	ExpressionThis: (_this, identifier) => new Expression.This(identifier.parse()),
	ExpressionObjectProperty: (name, colon, value) => ({ name: name.parse(), value: value.parse() }),
	ExpressionObject: (open, property, close) => new Expression.Object(property.asIteration().parse()),
	ExpressionArray: (open, element, close) => new Expression.Array(element.asIteration().parse()),
	ExpressionAtom: _default,
	ExpressionAtom_parentheses: (open, expression, close) => expression.parse(),
	ExpressionMember: _default,
	ExpressionCall_call: (expression, argument) => new Expression.Call(expression.parse(), argument.parse()),
	ExpressionMember_property: (expression, dot, property) => new Expression.Property(expression.parse(), property.parse()),
	ExpressionMember_index: (expression, sharp, index) => new Expression.Index(expression.parse(), index.parse()),
	ExpressionCount_count: unary,
	ExpressionAdd: _default,
	ExpressionAdd_add: binary,
	ExpressionMultiply: _default,
	ExpressionMultiply_multiply: binary,
	ExpressionAddUnary: _default,
	ExpressionAddUnary_add: unary,
	ExpressionCompare: _default,
	ExpressionCompare_compare: binary,
	ExpressionNot: _default,
	ExpressionNot_not: unary,
	ExpressionAnd: _default,
	ExpressionAnd_and: binary,
	ExpressionOr: _default,
	ExpressionOr_or: binary,
	ExpressionQuery: _default,
	ExpressionQuery_filter: (expression, where, filter) => new Expression.Filter(
		expression.parse(),
		filter.parse()
	),
	ExpressionQuery_map: (expression, map, mapper) => new Expression.Map(
		expression.parse(),
		mapper.parse()
	),
	ExpressionQuery_limit: (expression, limit, limiter) => new Expression.Limit(
		expression.parse(),
		limiter.parse()
	),
	ExpressionQuery_order: (expression, order, orderer) => new Expression.Order(
		expression.parse(),
		orderer.parse()
	),
	ExpressionComma: _default,
	ExpressionComma_comma: (name, equal, value, comma, body) => new Expression.Comma(
		{
			name: name.parse(),
			value: value.parse()
		},
		body.parse()
	),
	Expression: _default,
	Declaration: (name, open, statement, close) => new Declaration(
		name.parse(),
		statement.children.map(p => p.parse())
	),
	DeclarationPropertyType: (identifier, colon, type, semicolon) => new Declaration.Statement.Property(identifier.parse(), { type: type.parse() }),
	DeclarationPropertyValue: (identifier, equal, value, semicolon) => new Declaration.Statement.Property(identifier.parse(), { value: value.parse() }),
	DeclarationId: (id, identifier, semicolon) => new Declaration.Statement.Id(identifier.parse())
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
var escape = {
	'"': '"',
	'\\': '\\',
	b: '\b',
	f: '\f',
	n: '\n',
	r: '\r',
	t: '\t',
	v: '\v'
};
module.exports = semantics;
