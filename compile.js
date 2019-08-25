var Scope = require('./Scope');
var Environment = require('./Environment');
function compile(expression) {
	switch (expression.type) {
		case 'literal':
			var $value = expression.value;
			return t(function () {
				return $value;
			}, typeof $value);
		case 'name':
			var $identifier = expression.identifier;
			return t(function () {
				return this.resolve($identifier)[0];
			}, this.resolve(expression.identifier)[0]);
		case 'property':
			var $expression = compile.call(this, expression.expression),
				$property = expression.property;
			return t(function () {
				return $expression.call(this)[$property];
			}, $expression.type[expression.property]);
		case 'index':
			var $expression = compile.call(this, expression.expression),
				$index = compile.call(this, expression.index);
			return t(function () {
				var id = $index.call(this);
				return $expression.call(this).find(
					value => value.id == id
				);
			}, $expression.type[0]);
		case 'unary':
			var $operand = compile.call(this, expression.operand),
				$operator = expression.operator;
			return t(function () {
				return operate(
					$operator,
					$operand.call(this)
				);
			}, operatetype(expression.operator, $operand.type));
		case 'binary':
			var $left = compile.call(this, expression.left),
				$right = compile.call(this, expression.right),
				$operator = expression.operator;
			return t(function () {
				return operate(
					$operator,
					$left.call(this),
					$right.call(this)
				);
			}, operatetype(expression.operator, $left.type, $right.type));
		case 'filter':
			var $expression = compile.call(this, expression.expression),
				$filter = compile.call(new Environment(new Scope({}, $expression.type[0]), this), expression.filter);
			return t(function () {
				return $expression.call(this).filter(
					value => truthy(
						$filter.call(new Environment(new Scope({}, value), this))
					)
				);
			}, $expression.type);
	}
	function t(_function, type) {
		_function.type = type;
		return _function;
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
function operatetype(operator, left, right) {
	switch (operator) {
		case '+':
			return left;
		case '-':
			return 'number';
		case '<=':
		case '=':
		case '>=':
		case '<':
		case '!=':
		case '>':
		case '!':
		case '&&':
		case '||':
			return 'boolean';
	}
}
function truthy(value) {
	return value instanceof Array ?
		value.length :
		value;
}
module.exports = compile;
