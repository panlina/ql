var Scope = require('./Scope');
var Expression = require('./Expression');
var Context = require('./Context');
var CompileError = require('./CompileError');
var TYPE = require('./Symbol').TYPE;
var QL = require('./Symbol').QL;
function compile(expression, interpretation) {
	var global = this;
	var table = require('lodash.transform')(global.scope.type, (result, value, key) => {
		result[global.scope.table ? global.scope.table(key) : key] = [value];
	});
	interpretation.pre(global, compile);
	var $expression = compile.call(this, expression);
	return t(interpretation.post($expression), $expression[TYPE]);
	function compile(expression) {
		if (interpretation.expression.compile) {
			var $expression = interpretation.expression.compile.call(this, expression);
			if ($expression)
				return $expression;
		}
		switch (expression.type) {
			case 'literal':
				var $value = expression.value;
				return t(
					interpretation.expression.literal($value),
					typeof $value
				);
			case 'name':
				var resolution = Context.resolve.call(this, global, expression);
				if (!resolution) {
					if (expression.identifier in table) {
						var $identifier = expression.identifier;
						return t(
							interpretation.expression.name.table($identifier),
							table[expression.identifier]
						);
					}
					if (expression.identifier in interpretation.constant) {
						var $identifier = expression.identifier;
						return t(
							interpretation.expression.name.constant($identifier),
							interpretation.constant[expression.identifier]
						);
					}
				}
				if (!resolution) throw new CompileError.UndefinedName(expression);
				var [value, [depth, key]] = resolution;
				if (key == 'this')
					return compile.call(this, new Expression.Property(new Expression.Name('this', depth), expression.identifier));
				var $identifier = expression.identifier;
				return t(
					// It's an exception to pass current environment to an expression interpreter. Its purpose is to make it possible for the interpretation to get the target environment, since `resolution` only provides `depth`.
					interpretation.expression.name.name.call(this, $identifier, resolution),
					value
				);
			case 'this':
				var type = global.scope.type[expression.identifier];
				if (!type) throw new CompileError.UndefinedName(expression);
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
				return t(
					interpretation.expression.object($property),
					$property.reduce(
						(o, p) => Object.assign(
							o,
							{ [p.name]: { type: p.value[TYPE] } }
						),
						{}
					)
				);
			case 'array':
				var $element = expression.element.map(
					element => compile.call(this, element)
				);
				if ($element.some(e => !require('./Type.equals')(e[TYPE], $element[0][TYPE])))
					throw new CompileError.HeterogeneousArray(expression);
				return t(
					interpretation.expression.array($element),
					[$element[0][TYPE]]
				);
			case 'tuple':
				var $element = expression.element.map(
					element => compile.call(this, element)
				);
				return t(
					interpretation.expression.tuple($element),
					new (require('./Type').Tuple)($element.map(e => e[TYPE]))
				);
			case 'id':
				var type = global.scope.type[expression.table];
				if (!type) throw new CompileError.UndefinedName(expression);
				var $property = require('./Type.id')(type),
					$id = compile.call(this, expression.id);
				if (typeof $id[TYPE] == 'object')
					throw new CompileError.NonPrimitiveId(expression);
				var $table = global.scope.table ? global.scope.table(expression.table) : expression.table;
				return t(
					interpretation.expression.find($table, $property, $id),
					type
				);
			case 'property':
				var $expression = compile.call(this, expression.expression),
					$property = expression.property;
				if (!(typeof $expression[TYPE] == 'object' && !($expression[TYPE] instanceof Array)))
					throw new CompileError.NonObjectPropertyAccess(expression);
				if (!(expression.property in $expression[TYPE]))
					throw new CompileError.PropertyNotFound(expression);
				if ($expression[TYPE][expression.property].value) {
					var $value = compile.call(
						global.push(
							Object.assign(
								new Scope({}, $expression[TYPE]),
								interpretation.expression.scope(new Scope({}, $expression), expression)
							)
						),
						$expression[TYPE][expression.property].value
					);
					return t(
						interpretation.expression.bind($value, new Scope({}, $expression), Infinity),
						$value[TYPE]
					);
				}
				return t(
					interpretation.expression.field($expression, $property),
					$expression[TYPE][expression.property].type
				);
			case 'element':
				var $expression = compile.call(this, expression.expression),
					$index = compile.call(this, expression.index);
				if (!($expression[TYPE] instanceof Array || $expression[TYPE] instanceof require('./Type').Tuple))
					throw new CompileError.NonArrayOrTupleIndex(expression);
				if (typeof $index[TYPE] == 'object')
					throw new CompileError.NonPrimitiveIndex(expression);
				if ($expression[TYPE] instanceof require('./Type').Tuple)
					if (expression.index.type != 'literal')
						throw new CompileError.NonLiteralTupleIndex(expression);
				return t(
					interpretation.expression.element($expression, $index),
					$expression[TYPE] instanceof Array ? $expression[TYPE][0] : $expression[TYPE].element[expression.index.value]
				);
			case 'call':
				var $expression = compile.call(this, expression.expression),
					$argument = compile.call(this, expression.argument);
				if (!require('./Type.equals')($argument[TYPE], $expression[TYPE].argument))
					throw new CompileError.WrongArgumentType(expression);
				return t(
					// It's an exception to pass current environment to an expression interpreter. Its purpose is to make it possible for the interpretation to get the target environment, since `resolution` only provides `depth`.
					interpretation.expression.call.call(this, $expression, $argument),
					$expression[TYPE].result
				);
			case 'operation':
				var $left = expression.left && compile.call(this, expression.left),
					$right = expression.right && compile.call(this, expression.right),
					$operator = expression.operator;
				try {
					var type = require("./Type.operate")(expression.operator, $left && $left[TYPE], $right && $right[TYPE]);
				} catch (e) {
					throw Object.assign(
						new CompileError(expression),
						{ message: e.message }
					);
				}
				return t(
					interpretation.expression.operation($operator, $left, $right),
					type
				);
			case 'conditional':
				var $condition = compile.call(this, expression.condition),
					$true = compile.call(this, expression.true),
					$false = compile.call(this, expression.false);
				if ($true[TYPE] != $false[TYPE])
					throw new CompileError.NonEqualConditionalType(expression);
				return t(
					interpretation.expression.conditional($condition, $true, $false),
					$true[TYPE]
				);
			case 'filter':
				var $expression = compile.call(this, expression.expression);
				if (!($expression[TYPE] instanceof Array))
					throw new CompileError.NonArrayFilter(expression);
				var $filter = compile.call(
					this.push(
						Object.assign(
							new Scope({}, $expression[TYPE][0]),
							interpretation.expression.scope(new Scope({}, $expression), expression)
						)
					),
					expression.filter
				);
				return t(
					interpretation.expression.filter($expression, $filter),
					$expression[TYPE]
				);
			case 'which':
				var $expression = compile.call(this, expression.expression);
				if (!($expression[TYPE] instanceof Array))
					throw new CompileError.NonArrayFilter(expression);
				var $filter = compile.call(
					this.push(
						Object.assign(
							new Scope({}, $expression[TYPE][0]),
							interpretation.expression.scope(new Scope({}, $expression), expression)
						)
					),
					expression.filter
				);
				return t(
					interpretation.expression.which($expression, $filter),
					$expression[TYPE][0]
				);
			case 'map':
				var $expression = compile.call(this, expression.expression);
				if (!($expression[TYPE] instanceof Array))
					throw new CompileError.NonArrayMap(expression);
				var $mapper = compile.call(
					this.push(
						Object.assign(
							new Scope({}, $expression[TYPE][0]),
							interpretation.expression.scope(new Scope({}, $expression), expression)
						)
					),
					expression.mapper
				);
				return t(
					interpretation.expression.map($expression, $mapper),
					[$mapper[TYPE]]
				);
			case 'limit':
				if (!(
					expression.limiter.type == 'tuple' &&
					expression.limiter.element.length == 2 &&
					expression.limiter.element[0].type == 'literal' &&
					typeof expression.limiter.element[0].value == 'number' &&
					expression.limiter.element[1].type == 'literal' &&
					typeof expression.limiter.element[1].value == 'number'
				))
					throw new CompileError.InvalidLimiter(expression);
				var $expression = compile.call(this, expression.expression),
					[start, length] = expression.limiter.element,
					[$start, $length] = [compile.call(this, start), compile.call(this, length)];
				if (!($expression[TYPE] instanceof Array))
					throw new CompileError.NonArrayLimit(expression);
				return t(
					interpretation.expression.limit($expression, [$start, $length]),
					$expression[TYPE]
				);
			case 'order':
				var $expression = compile.call(this, expression.expression);
				if (!($expression[TYPE] instanceof Array))
					throw new CompileError.NonArrayOrder(expression);
				var $orderer = compile.call(
					this.push(
						Object.assign(
							new Scope({}, $expression[TYPE][0]),
							interpretation.expression.scope(new Scope({}, $expression), expression)
						)
					),
					expression.orderer
				),
					$direction = expression.direction;
				if (typeof $orderer[TYPE] == 'object')
					throw new CompileError.NonPrimitiveOrder(expression);
				return t(
					interpretation.expression.order($expression, $orderer, $direction),
					$expression[TYPE]
				);
			case 'group':
				var $expression = compile.call(this, expression.expression);
				if (!($expression[TYPE] instanceof Array))
					throw new CompileError.NonArrayGroup(expression);
				var $grouper = compile.call(
					this.push(
						Object.assign(
							new Scope({}, $expression[TYPE][0]),
							interpretation.expression.scope(new Scope({}, $expression), expression)
						)
					),
					expression.grouper
				);
				if (typeof $grouper[TYPE] != 'string')
					throw new CompileError.NonPrimitiveGroup(expression);
				return t(
					interpretation.expression.group($expression, $grouper),
					[{
						key: { type: $grouper[TYPE] },
						value: { type: $expression[TYPE] }
					}]
				);
			case 'distinct':
				var $expression = compile.call(this, expression.expression);
				if (!($expression[TYPE] instanceof Array))
					throw new CompileError.NonArrayDistinct(expression);
				return t(
					interpretation.expression.distinct($expression),
					$expression[TYPE]
				);
			case 'comma':
				var $head = {
					name: expression.head.name,
					value: compile.call(this, expression.head.value)
				},
					$body = compile.call(
						this.push(
							Object.assign(
								new Scope({ [$head.name]: $head.value[TYPE] }),
								interpretation.expression.scope(new Scope({ [$head.name]: $head.value }), expression)
							)
						),
						expression.body
					);
				return t(
					interpretation.expression.bind($body, new Scope({ [$head.name]: $head.value })),
					$body[TYPE]
				);
		}
		function t($expression, type) {
			$expression[TYPE] = type;
			$expression[QL] = expression;
			return $expression;
		}
	}
	function t($expression, type) {
		$expression[TYPE] = type;
		$expression[QL] = expression;
		return $expression;
	}
}
module.exports = compile;
