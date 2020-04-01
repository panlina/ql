var parse = require('./parse');
var Expression = require('./Expression');
var traverse = require('traverse');
function ql(strings, ...expressions) {
	var s = "";
	for (var i = 0; i < expressions.length; i++)
		s += strings[i] + `%_${i}%`;
	s += strings[i];
	var s = parse(s);
	traverse(s).forEach(function (v) {
		if (v instanceof Expression.Placeholder)
			this.update(expressions[+v.name.substr(1)], true);
	});
	return s;
}
module.exports = ql;
