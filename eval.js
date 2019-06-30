var Expression = require('./Expression');
function eval(expression, environment) {
	switch (expression.constructor) {
		case Expression.Name:
			return environment[expression.identifier];
		case Expression.Filter:
			return eval(expression.expression, environment).filter(
				value => truthy(
					eval(expression.filter, { __proto__: environment, ...value })
				)
			);
	}
}
function truthy(value) {
	return value instanceof Array ?
		value.length :
		value;
}
module.exports = eval;
