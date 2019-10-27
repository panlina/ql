var Scope = require('./Scope');
var Expression = require('./Expression');
var Context = require('./Context');
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
				var [value, [depth, key]] = Context.resolve.call(this, global, expression);
				if (key == 'this' && value.value)
					return compile.call(this, new Expression.Property(new Expression.Name('this', depth), expression.identifier));
				var $identifier = expression.identifier;
				return t(function (global) {
					return Context.ancestor.call(this, global, depth).scope.resolve($identifier)[0];
				}, value);
			case 'this':
				var type = global.scope.type[expression.identifier];
				var [, , , depth] = this.find((value, name, key) => key == 'local' && name == 'this' && value == type);
				return compile.call(this, new Expression.Name('this', depth));
			case 'property':
				var $expression = compile.call(this, expression.expression),
					$property = expression.property;
				if ($expression.type[expression.property].value) {
					var $value = compile.call(global.push(new Scope({}, $expression.type)), $expression.type[expression.property].value);
					return t(function (global) {
						return $value.call(global.push(new Scope({}, $expression.call(this, global))), global)
					}, $value.type);
				}
				return t(function (global) {
					return $expression.call(this, global)[$property];
				}, $expression.type[expression.property].type);
			case 'index':
				var $expression = compile.call(this, expression.expression),
					$index = compile.call(this, expression.index);
				return t(function (global) {
					var id = $index.call(this, global);
					var $id = require('./Type.id')($expression.type[0])
					return $expression.call(this, global).find(
						value => value[$id] == id
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
				}, require("./Type.operate")(expression.operator, $operand.type));
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
				}, require("./Type.operate")(expression.operator, $left.type, $right.type));
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
		case '#':
			return left.length;
	}
}
function truthy(value) {
	return value instanceof Array ?
		value.length :
		value;
}
module.exports = compile;
