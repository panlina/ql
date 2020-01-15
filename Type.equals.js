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
		typeof t == 'object' && !(t instanceof Array) && typeof s == 'object' && !(s instanceof Array)
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
