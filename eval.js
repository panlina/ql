var Expression = require('./Expression');
function eval(expression, environment) {
	switch (expression.constructor) {
		case Expression.Name:
			return environment[expression.identifier];
		case Expression.Filter:
			return eval(expression.expression, environment).filter(
				value => eval(expression.filter, { __proto__: environment, ...value })
			);
	}
}
module.exports = eval;
