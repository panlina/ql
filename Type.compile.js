var Declaration = require('./Declaration');
function compile(declarations) {
	var $return = {};
	for (var declaration of declarations) {
		var type = {};
		for (var s of declaration.statement)
			if (s instanceof Declaration.Statement.Property)
				type[s.name] = {
					[s.type ? 'type' : s.value ? 'value' : 0]: s.type || s.value
				};
			else if (s instanceof Declaration.Statement.Id)
				type.$ql = Object.assign(type.$ql || {}, { id: s.property });
		$return[declaration.name] = type;
	}
	return $return;
}
module.exports = compile;
