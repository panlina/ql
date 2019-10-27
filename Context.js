function resolve(global, expression) {
	if (expression.depth != null)
		var [value, key] = ancestor.call(this, global, expression.depth).scope.resolve(expression.identifier),
			depth = expression.depth;
	else
		var [value, [depth, key]] = this.resolve(expression.identifier);
	return [value, [depth, key]];
}
function ancestor(global, depth) {
	return depth == Infinity ?
		global :
		this.ancestor(depth);
}
exports.resolve = resolve;
exports.ancestor = ancestor;
