function parse(type) {
	if (typeof type == 'string')
		return type;
	if (type instanceof Array)
		return [parse(type[0])];
	return require('lodash.mapvalues')(type, text => {
		var type = text[0],
			value = text.substr(1);
		switch (type) {
			case ':': return { type: parse(value) }
			case '=': return { value: require('./parse')(value) }
		}
	});
}
module.exports = parse;
