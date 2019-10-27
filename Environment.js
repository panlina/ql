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
	*[Symbol.iterator]() {
		yield this.scope;
		if (this.parent)
			yield* this.parent;
	}
	find(f, filter) {
		var depth = 0;
		for (var scope of this) {
			var result = scope.find(f, filter);
			if (result) {
				var [value, name, key] = result;
				return [value, name, key, depth];
			}
			depth++;
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
