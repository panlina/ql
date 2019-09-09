class Environment {
	constructor(scope, parent) {
		this.scope = scope;
		this.parent = parent;
	}
	resolve(name) {
		var resolution = this.scope.resolve(name);
		if (resolution) {
			var [value, key] = resolution;
			return [value, [this.scope, key]];
		}
		if (this.parent)
			return this.parent.resolve(name);
	}
	push(scope) { return new Environment(scope, this); }
}
module.exports = Environment;
