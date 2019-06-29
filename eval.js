var Expression = require('./Expression');
function eval(expression, environment) {
	switch (expression.constructor) {
		case Expression.Name:
			return environment[expression.identifier];
	}
}
module.exports = eval;
