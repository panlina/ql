class Environment {
	constructor(scope, parent) {
		this.scope = scope;
		this.parent = parent;
	}
	resolve(name) {
		var resolution = this.scope.resolve(name);
		if (resolution) {
			var [value, key] = resolution;
			return [value, [0, key]];
		}
		if (this.parent) {
			var [value, [depth, key]] = this.parent.resolve(name);
			return [value, [depth + 1, key]];
		}
	}
	ancestor(depth) {
		return depth ?
			this.parent.ancestor(depth - 1) :
			this;
	}
	push(scope) { return new Environment(scope, this); }
}
module.exports = Environment;
