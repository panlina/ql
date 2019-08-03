var Scope = require('./Scope');
var Environment = require('./Environment');
function compile(expression) {
	switch (expression.type) {
		case 'literal':
			var $value = expression.value;
			return function () {
				return $value;
			};
		case 'name':
			var $identifier = expression.identifier;
			return function () {
				return this.resolve($identifier);
			};
		case 'property':
			var $expression = compile(expression.expression),
				$property = expression.property;
			return function () {
				return $expression.call(this)[$property];
			};
		case 'index':
			var $expression = compile(expression.expression),
				$index = compile(expression.index);
			return function () {
				var id = $index.call(this);
				return $expression.call(this).find(
					value => value.id == id
				);
			};
		case 'unary':
			var $operand = compile(expression.operand),
				$operator = expression.operator;
			return function () {
				return operate(
					$operator,
					$operand.call(this)
				);
			};
		case 'binary':
			var $left = compile(expression.left),
				$right = compile(expression.right),
				$operator = expression.operator;
			return function () {
				return operate(
					$operator,
					$left.call(this),
					$right.call(this)
				);
			};
		case 'filter':
			var $expression = compile(expression.expression),
				$filter = compile(expression.filter);
			return function () {
				return $expression.call(this).filter(
					value => truthy(
						$filter.call(new Environment(new Scope({}, value), this))
					)
				);
			};
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
module.exports = compile;
