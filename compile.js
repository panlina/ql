var Scope = require('./Scope');
var Expression = require('./Expression');
var Context = require('./Context');
var CompileError = require('./CompileError');
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
				var resolution = Context.resolve.call(this, global, expression);
				if (!resolution)
					if (expression.identifier in constant) {
						var $identifier = expression.identifier;
						return t(function (global) {
							return runtime.constant[$identifier];
						}, constant[expression.identifier]);
					}
				if (!resolution) throw new CompileError.UndefinedName(expression);
				var [value, [depth, key]] = resolution;
				if (key == 'this')
					return compile.call(this, new Expression.Property(new Expression.Name('this', depth), expression.identifier));
				var $identifier = expression.identifier;
				return t(function (global) {
					return Context.ancestor.call(this, global, depth).scope.resolve($identifier)[0];
				}, value);
			case 'this':
				var type = global.scope.type[expression.identifier];
				var resolution = this.find(value => value == type, { key: 'local', name: 'this' });
				if (!resolution) throw new CompileError.UnresolvedReference(expression);
				var [, , , depth] = resolution;
				return compile.call(this, new Expression.Name('this', depth));
			case 'property':
				var $expression = compile.call(this, expression.expression),
					$property = expression.property;
				if (!(typeof $expression.type == 'object' && !($expression.type instanceof Array)))
					throw new CompileError.NonObjectPropertyAccess(expression);
				if (!(expression.property in $expression.type))
					throw new CompileError.PropertyNotFound(expression);
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
				if (!($expression.type instanceof Array))
					throw new CompileError.NonArrayIndex(expression);
				if (typeof $index.type == 'object')
					throw new CompileError.NonPrimitiveIndex(expression);
				return t(function (global) {
					var id = $index.call(this, global);
					var $id = require('./Type.id')($expression.type[0])
					return $expression.call(this, global).find(
						value => value[$id] == id
					);
				}, $expression.type[0]);
			case 'call':
				var $expression = compile.call(this, expression.expression),
					$argument = compile.call(this, expression.argument);
				if (!require('./Type.equals')($argument.type, $expression.type.argument))
					throw new CompileError.WrongArgumentType(expression);
				return t(function (global) {
					return $expression.call(this, global)($argument.call(this, global));
				}, $expression.type.result);
			case 'operation':
				var $left = expression.left && compile.call(this, expression.left),
					$right = expression.right && compile.call(this, expression.right),
					$operator = expression.operator;
				try {
					var type = require("./Type.operate")(expression.operator, $left && $left.type, $right && $right.type);
				} catch (e) {
					throw Object.assign(
						new CompileError(expression),
						{ message: e.message }
					);
				}
				return t(function (global) {
					return operate(
						$operator,
						$left && $left.call(this, global),
						$right && $right.call(this, global)
					);
				}, type);
			case 'filter':
				var $expression = compile.call(this, expression.expression),
					$filter = compile.call(this.push(new Scope({}, $expression.type[0])), expression.filter);
				if (!($expression.type instanceof Array))
					throw new CompileError.NonArrayFilter(expression);
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
		case '*':
			return left * right;
		case '/':
			return left / right;
		case '+':
			return left != undefined ? left + right : right;
		case '-':
			return left != undefined ? left - right : -right;
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
			return !right;
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
var constant = {
	false: 'boolean',
	true: 'boolean',
	length: new (require('./Type').Function)('string', 'number')
};
var runtime = {
	constant: {
		false: false,
		true: true,
		length: s => s.length
	}
};
module.exports = compile;
