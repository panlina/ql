var Expression = require('./Expression');
function eval(expression, environment) {
	if (typeof expression == 'number')
		return expression;
	if (typeof expression == 'string')
		return expression;
	switch (expression.constructor) {
		case Expression.Name:
			return environment[expression.identifier];
		case Expression.Add:
			return operate(
				expression.operator,
				eval(expression.left, environment),
				eval(expression.right, environment)
			);
		case Expression.Compare:
			return operate(
				expression.operator,
				eval(expression.left, environment),
				eval(expression.right, environment)
			);
		case Expression.Logic:
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
