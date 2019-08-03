var compile = require('./compile');
function eval(expression, environment) {
	return compile(expression).call(environment);
}
module.exports = eval;
