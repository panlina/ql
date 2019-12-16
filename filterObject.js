function filterObject(object, filter) {
	var o = {};
	for (var key in object)
		if (filter(object[key]))
			o[key] = object[key];
	return o;
}
module.exports = filterObject;
