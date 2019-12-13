var Function = require('./Type').Function;
function equals(t, s) {
	return (
		typeof t == 'string' && typeof s == 'string'
		&& t == s
		||
		t instanceof Function && s instanceof Function
		&& equals(t.argument, s.argument)
		&& equals(t.result, s.result)
		||
		t instanceof Array && s instanceof Array
		&& equals(t[0], s[0])
		||
		t == s
	);
}
module.exports = equals;
