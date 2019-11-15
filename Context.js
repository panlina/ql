function resolve(global, expression) {
	if (expression.depth != null) {
		var resolution = ancestor.call(this, global, expression.depth).scope.resolve(expression.identifier);
		if (!resolution) return;
		var [value, key] = resolution,
			depth = expression.depth;
	} else {
		var resolution = this.resolve(expression.identifier);
		if (!resolution) return;
		var [value, [depth, key]] = resolution;
	}
	return [value, [depth, key]];
}
function ancestor(global, depth) {
	return depth == Infinity ?
		global :
		this.ancestor(depth);
}
exports.resolve = resolve;
exports.ancestor = ancestor;
