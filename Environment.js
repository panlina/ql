class Environment {
	constructor(scope, parent) {
		this.scope = scope;
		this.parent = parent;
	}
	resolve(name) {
		var value = this.scope.resolve(name);
		if (value !== undefined)
			return value;
		if (this.parent)
			return this.parent.resolve(name);
	}
}
module.exports = Environment;
