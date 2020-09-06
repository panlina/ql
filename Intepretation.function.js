var Scope = require('./Scope');
var Context = require('./Context');
module.exports = {
	pre() { },
	post(_function) {
		return function () {
			var global = this;
			return _function.call(this, global);
		};
	},
	expression: {
		literal($value) {
			return function () {
				return $value;
			};
		},
		name: {
			table($identifier) {
				return function (global) {
					return global.scope.table[$identifier];
				};
			},
			constant($identifier) {
				return function () {
					return constant[$identifier];
				};
			},
			name($identifier, resolution) {
				var [value, [depth, key]] = resolution;
				return function (global) {
					return Context.ancestor.call(this, global, depth).scope.resolve($identifier)[0];
				};
			}
		},
		object($property) {
			return function (global) {
				return $property.reduce(
					(o, p) => Object.assign(
						o,
						{ [p.name]: p.value.call(this, global) }
					),
					{}
				);
			};
		},
		array($element) {
			return function (global) {
				return $element.map(
					e => e.call(this, global)
				);
			};
		},
		tuple($element) {
			return function (global) {
				return $element.map(
					e => e.call(this, global)
				);
			};
		},
		find($table, $property, $id) {
			return function (global) {
				var id = $id.call(this, global);
				return global.scope.table[$table].find(
					value => value[$property] == id
				);
			};
		},
		field($expression, $property) {
			return function (global) {
				return $expression.call(this, global)[$property];
			};
		},
		element($expression, $index) {
			return function (global) {
				return $expression.call(this, global)[$index.call(this, global)];
			};
		},
		call($expression, $argument) {
			return function (global) {
				return $expression.call(this, global)($argument.call(this, global));
			};
		},
		operation($operator, $left, $right) {
			return function (global) {
				return operate(
					$operator,
					$left && $left.call(this, global),
					$right && $right.call(this, global)
				);
			};
		},
		conditional($condition, $true, $false) {
			return function (global) {
				return truthy($condition.call(this, global)) ?
					$true.call(this, global) :
					$false.call(this, global);
			};
		},
		filter($expression, $filter) {
			return function (global) {
				return $expression.call(this, global).filter(
					value => truthy(
						$filter.call(this.push(new Scope({}, value)), global)
					)
				);
			};
		},
		map($expression, $mapper) {
			return function (global) {
				return $expression.call(this, global).map(
					value => $mapper.call(this.push(new Scope({}, value)), global)
				);
			};
		},
		limit($expression, $limiter) {
			return function (global) {
				var limiter = $limiter.call(this, global);
				return $expression.call(this, global).slice(limiter[0], limiter[0] + limiter[1]);
			};
		},
		order($expression, $orderer, $direction) {
			var $sorter = $direction ?
				(a, b) => a < b ? 1 : a > b ? -1 : 0 :
				(a, b) => a < b ? -1 : a > b ? 1 : 0;
			return function (global) {
				return $expression.call(this, global).sort(
					(a, b) => {
						var a = $orderer.call(this.push(new Scope({}, a)), global);
						var b = $orderer.call(this.push(new Scope({}, b)), global);
						return $sorter(a, b);
					}
				);
			};
		},
		group($expression, $grouper) {
			return function (global) {
				return Object.entries(
					require('lodash.groupby')(
						$expression.call(this, global),
						value => $grouper.call(this.push(new Scope({}, value)), global)
					)
				).map(([key, value]) => ({ key: key, value: value }));
			};
		},
		distinct($expression) {
			return function (global) {
				return require('lodash.uniqwith')(
					$expression.call(this, global),
					require('lodash.isequal')
				);
			};
		},
		bind($value, scope, environment = 0) {
			return function (global) {
				return $value.call(
					Context.ancestor.call(this, global, environment).push(
						new Scope(
							require('lodash.mapvalues')(scope.local, value => value.call(this, global)),
							scope.this ? scope.this.call(this, global) : undefined
						)
					), global
				);
			};
		}
	},
	constant: {
		false: 'boolean',
		true: 'boolean',
		length: new (require('./Type').Function)('string', 'number')
	}
};
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
	false: false,
	true: true,
	length: s => s.length
};
