function parse(type) {
	if (typeof type == 'string')
		return type;
	if (type instanceof Array)
		return [parse(type[0])];
	return require('lodash.mapvalues')(type, value => {
		var type = value[0],
			value = value.substr(1);
		switch (type) {
			case ':': return { type: parse(value) }
			case '=': return { value: require('./parse')(value) }
		}
	});
}
module.exports = parse;
