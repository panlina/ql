function eval(expression, environment) {
	switch (expression.type) {
		case 'literal':
			return expression.value;
		case 'name':
			return environment[expression.identifier];
		case 'unary':
			return operate(
				expression.operator,
				eval(expression.operand, environment)
			);
		case 'binary':
			return operate(
				expression.operator,
				eval(expression.left, environment),
				eval(expression.right, environment)
			);
		case 'filter':
			return eval(expression.expression, environment).filter(
				value => truthy(
					eval(expression.filter, { __proto__: environment, ...value, this: value })
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
