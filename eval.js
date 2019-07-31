var Scope = require('./Scope');
var Environment = require('./Environment');
function eval(expression, environment) {
	switch (expression.type) {
		case 'literal':
			return expression.value;
		case 'name':
			return environment.resolve(expression.identifier);
		case 'property':
			return eval(expression.expression, environment)[expression.property];
		case 'index':
			var index = eval(expression.index, environment);
			return eval(expression.expression, environment).find(
				value => value.id == index
			);
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
					eval(expression.filter, new Environment(new Scope({}, value), environment))
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
		case '<=':
			return left <= right;
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
