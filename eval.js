var Expression = require('./Expression');
function eval(expression, environment) {
	switch (expression.constructor) {
		case Expression.Literal:
			return expression.value;
		case Expression.Name:
			return environment[expression.identifier];
		case Expression.Unary:
			return operate(
				expression.operator,
				eval(expression.operand, environment)
			);
		case Expression.Binary:
			return operate(
				expression.operator,
				eval(expression.left, environment),
				eval(expression.right, environment)
			);
		case Expression.Filter:
			return eval(expression.expression, environment).filter(
				value => truthy(
					eval(expression.filter, { __proto__: environment, ...value })
				)
			);
	}
}
function operate(operator, left, right) {
	switch (operator) {
		case '+':
			return left + right;
		case '-':
			return left - right;
		case '=':
			return left == right;
		case '>=':
			return left >= right;
		case '<':
			return left < right;
		case '!=':
			return left != right;
		case '>':
			return left > right;
		case '!':
			return !left;
		case '&&':
			return left && right;
		case '||':
			return left || right;
	}
}
function truthy(value) {
	return value instanceof Array ?
		value.length :
		value;
}
module.exports = eval;
