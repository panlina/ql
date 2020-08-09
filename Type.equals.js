var Function = require('./Type').Function;
var Tuple = require('./Type').Tuple;
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
		t instanceof Tuple && s instanceof Tuple
		&& t.element.length == s.element.length
		&& t.element.every((t, i) => equals(t, s.element[i]))
		||
		typeof t == 'object' && !(t instanceof Array) && !(t instanceof Tuple) && !(t instanceof Function)
		&&
		typeof s == 'object' && !(s instanceof Array) && !(s instanceof Tuple) && !(s instanceof Function)
		&& (() => {
			for (var key in t)
				if (t[key].type)
					if (
						!(key in s)
						||
						!s[key].type
						||
						!equals(t[key].type, s[key].type)
					)
						return false;
			if (Object.values(t).filter(v => v.type).length != Object.values(s).filter(v => v.type).length)
				return false;
			return true;
		})()
	);
}
module.exports = equals;
