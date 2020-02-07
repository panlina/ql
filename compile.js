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
			case 'object':
				var $property = expression.property.map(
					property => ({
						name: property.name,
						value: compile.call(this, property.value)
					})
				);
				return t(function (global) {
					return $property.reduce(
						(o, p) => Object.assign(
							o,
							{ [p.name]: p.value.call(this, global) }
						),
						{}
					);
				}, $property.reduce(
					(o, p) => Object.assign(
						o,
						{ [p.name]: { type: p.value.type } }
					),
					{}
				));
			case 'array':
				var $element = expression.element.map(
					element => compile.call(this, element)
				);
				if ($element.some(e => !require('./Type.equals')(e.type, $element[0].type)))
					throw new CompileError.HeterogeneousArray(expression);
				return t(function (global) {
					return $element.map(
						e => e.call(this, global)
					);
				}, [$element[0].type]);
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
			case 'conditional':
				var $condition = compile.call(this, expression.condition),
					$true = compile.call(this, expression.true),
					$false = compile.call(this, expression.false);
				if ($true.type != $false.type)
					throw new CompileError.NonEqualConditionalType(expression);
				return t(function (global) {
					return truthy($condition.call(this, global)) ?
						$true.call(this, global) :
						$false.call(this, global);
				}, $true.type);
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
			case 'map':
				var $expression = compile.call(this, expression.expression),
					$mapper = compile.call(this.push(new Scope({}, $expression.type[0])), expression.mapper);
				if (!($expression.type instanceof Array))
					throw new CompileError.NonArrayMap(expression);
				return t(function (global) {
					return $expression.call(this, global).map(
						value => $mapper.call(this.push(new Scope({}, value)), global)
					);
				}, [$mapper.type]);
			case 'limit':
				var $expression = compile.call(this, expression.expression),
					$limiter = compile.call(this, expression.limiter);
				if (!($expression.type instanceof Array))
					throw new CompileError.NonArrayLimit(expression);
				if (!(
					expression.limiter.type == 'array' &&
					expression.limiter.element.length == 2 &&
					expression.limiter.element[0].type == 'literal' &&
					typeof expression.limiter.element[0].value == 'number' &&
					expression.limiter.element[1].type == 'literal' &&
					typeof expression.limiter.element[1].value == 'number'
				))
					throw new CompileError.InvalidLimiter(expression);
				return t(function (global) {
					var limiter = $limiter.call(this, global);
					return $expression.call(this, global).slice(limiter[0], limiter[0] + limiter[1]);
				}, $expression.type);
			case 'order':
				var $expression = compile.call(this, expression.expression),
					$orderer = compile.call(this.push(new Scope({}, $expression.type[0])), expression.orderer);
				if (!($expression.type instanceof Array))
					throw new CompileError.NonArrayOrder(expression);
				if (typeof $orderer.type == 'object')
					throw new CompileError.NonPrimitiveOrder(expression);
				var $sorter = expression.direction ?
					(a, b) => a < b ? 1 : a > b ? -1 : 0 :
					(a, b) => a < b ? -1 : a > b ? 1 : 0;
				return t(function (global) {
					return $expression.call(this, global).sort(
						(a, b) => {
							var a = $orderer.call(this.push(new Scope({}, a)), global);
							var b = $orderer.call(this.push(new Scope({}, b)), global);
							return $sorter(a, b);
						}
					);
				}, $expression.type);
			case 'group':
				var $expression = compile.call(this, expression.expression),
					$grouper = compile.call(
						this.push(
							new Scope({}, $expression.type[0])
						),
						expression.grouper
					);
				if (!($expression.type instanceof Array))
					throw new CompileError.NonArrayGroup(expression);
				if (typeof $grouper.type != 'string')
					throw new CompileError.NonPrimitiveGroup(expression);
				return t(function (global) {
					return Object.entries(
						require('lodash.groupby')(
							$expression.call(this, global),
							value => $grouper.call(this.push(new Scope({}, value)), global)
						)
					).map(([key, value]) => ({ key: key, value: value }));
				}, [{
					key: { type: $grouper.type },
					value: { type: $expression.type }
				}]);
			case 'distinct':
				var $expression = compile.call(this, expression.expression);
				if (!($expression.type instanceof Array))
					throw new CompileError.NonArrayDistinct(expression);
				return t(function (global) {
					return require('lodash.uniqwith')(
						$expression.call(this, global),
						require('lodash.isequal')
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
		case 'in':
			return right.includes(left);
		case '!':
			return !right;
		case '&':
			return left && right;
		case '|':
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
