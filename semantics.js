var grammar = require('./grammar');
var Expression = require('./Expression');
var Declaration = require('./Declaration');
var semantics = grammar.createSemantics().addOperation('parse', {
	number: (integer, dot, decimal) => new Expression.Literal(+(integer.sourceString + dot.sourceString)),
	string: (open, x, close) => new Expression.Literal(x.children.map(char => char.parse()).join('')),
	char_literal: x => x.sourceString,
	char_escaped: (backslash, x) => escape[x.sourceString],
	identifier: (_, x) => x.sourceString,
	ExpressionName: (global, identifier) => new Expression.Name(identifier.parse(), global.sourceString ? Infinity : null),
	ExpressionThis: (_this, identifier) => new Expression.This(identifier.parse()),
	ExpressionObjectProperty: (name, colon, value) => ({ name: name.parse(), value: value.parse() }),
	ExpressionObject: (open, property, close) => new Expression.Object(property.asIteration().parse()),
	ExpressionArray: (open, element, close) => new Expression.Array(element.asIteration().parse()),
	ExpressionTuple: (open, element, close) => new Expression.Tuple(element.asIteration().parse()),
	ExpressionAtom_parentheses: (open, expression, close) => expression.parse(),
	ExpressionAtom_placeholder: (open, name, close) => new Expression.Placeholder(name.parse()),
	ExpressionId_id: (identifier, sharp, id) => new Expression.Id(identifier.parse(), id.parse()),
	ExpressionCall_call: (expression, argument) => new Expression.Call(expression.parse(), argument.parse()),
	ExpressionMember_property: (expression, dot, property) => new Expression.Property(expression.parse(), property.parse()),
	ExpressionMember_element: (expression, at, index) => new Expression.Element(expression.parse(), index.parse()),
	ExpressionCount_count: unary,
	ExpressionAdd_add: binary,
	ExpressionMultiply_multiply: binary,
	ExpressionAddUnary_add: unary,
	ExpressionRelation_relation: binary,
	ExpressionNot_not: unary,
	ExpressionAnd_and: binary,
	ExpressionOr_or: binary,
	ExpressionConditional_conditional: (condition, question, _true, colon, _false) => new Expression.Conditional(
		condition.parse(),
		_true.parse(),
		_false.parse()
	),
	ExpressionQuery_filter: (expression, where, filter) => new Expression.Filter(
		expression.parse(),
		filter.parse()
	),
	ExpressionQuery_which: (expression, which, filter) => new Expression.Which(
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
	ExpressionQuery_order: (expression, order, orderer, direction) => new Expression.Order(
		expression.parse(),
		orderer.parse(),
		{ asc: false, desc: true }[direction.sourceString]
	),
	ExpressionQuery_group: (expression, group, grouper) => new Expression.Group(
		expression.parse(),
		grouper.parse()
	),
	ExpressionQuery_distinct: (distinct, expression) => new Expression.Distinct(
		expression.parse()
	),
	ExpressionComma_comma: (name, equal, value, comma, body) => new Expression.Comma(
		{
			name: name.parse(),
			value: value.parse()
		},
		body.parse()
	),
	Declaration: (name, open, statement, close) => new Declaration(
		name.parse(),
		statement.children.map(p => p.parse())
	),
	DeclarationPropertyType: (identifier, colon, type, semicolon) => new Declaration.Statement.Property(identifier.parse(), { type: type.parse() }),
	DeclarationPropertyValue: (identifier, equal, value, semicolon) => new Declaration.Statement.Property(identifier.parse(), { value: value.parse() }),
	DeclarationId: (id, identifier, semicolon) => new Declaration.Statement.Id(identifier.parse())
});
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
