var Scope = require('./Scope');
function compile(expression) {
	var global = this;
	var _function = compile.call(this, expression);
	return t(function () {
		var global = this;
		return _function.call(this, global);
	}, _function.type);
	function compile(expression) {
		switch (expression.type) {
			case 'literal':
				var $value = expression.value;
				return t(function () {
					return $value;
				}, typeof $value);
			case 'name':
				var $identifier = expression.identifier;
				return expression.depth == Infinity ?
					t(function (global) {
						return global.resolve($identifier)[0];
					}, global.resolve(expression.identifier)[0]) :
					t(function () {
						return this.resolve($identifier)[0];
					}, this.resolve(expression.identifier)[0]);
			case 'property':
				var $expression = compile.call(this, expression.expression),
					$property = expression.property;
				return t(function (global) {
					return $expression.call(this, global)[$property];
				}, $expression.type[expression.property]);
			case 'index':
				var $expression = compile.call(this, expression.expression),
					$index = compile.call(this, expression.index);
				return t(function (global) {
					var id = $index.call(this, global);
					return $expression.call(this, global).find(
						value => value.id == id
					);
				}, $expression.type[0]);
			case 'unary':
				var $operand = compile.call(this, expression.operand),
					$operator = expression.operator;
				return t(function (global) {
					return operate(
						$operator,
						$operand.call(this, global)
					);
				}, operatetype(expression.operator, $operand.type));
			case 'binary':
				var $left = compile.call(this, expression.left),
					$right = compile.call(this, expression.right),
					$operator = expression.operator;
				return t(function (global) {
					return operate(
						$operator,
						$left.call(this, global),
						$right.call(this, global)
					);
				}, operatetype(expression.operator, $left.type, $right.type));
			case 'filter':
				var $expression = compile.call(this, expression.expression),
					$filter = compile.call(this.push(new Scope({}, $expression.type[0])), expression.filter);
				return t(function (global) {
					return $expression.call(this, global).filter(
						value => truthy(
							$filter.call(this.push(new Scope({}, value)), global)
						)
					);
				}, $expression.type);
			case 'comma':
				var $head = {
					name: expression.head.name,
					value: compile.call(this, expression.head.value)
				},
					$body = compile.call(this.push(new Scope({ [$head.name]: $head.value.type })), expression.body);
				return t(function (global) {
					return $body.call(
						this.push(new Scope({ [$head.name]: $head.value.call(this, global) })),
						global
					);
				}, $body.type);
		}
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
