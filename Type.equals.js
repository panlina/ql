function equals(t, s) {
	return (
		typeof t == 'string' && typeof s == 'string'
		&& t == s
		||
		t instanceof Array && s instanceof Array
		&& equals(t[0], s[0])
		||
		t == s
	);
}
module.exports = equals;
