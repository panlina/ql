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
function findDepth(type) {
	if (this.scope.this == type)
		return 0;
	if (this.parent)
		return findDepth.call(this.parent, type) + 1;
}
exports.resolve = resolve;
exports.ancestor = ancestor;
exports.findDepth = findDepth;
