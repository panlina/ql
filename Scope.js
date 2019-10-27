class Scope {
	constructor(local, $this) {
		this.local = local;
		this.this = $this;
	}
	resolve(name) {
		if (name in this.local)
			return [this.local[name], 'local'];
		if (this.this) {
			if (name == 'this')
				return [this.this, 'local'];
			if (name in this.this)
				return [this.this[name], 'this'];
		}
	}
	*[Symbol.iterator]() {
		for (var name in this.local)
			yield [this.local[name], name, 'local'];
		if (this.this) {
			yield [this.this, 'this', 'local'];
			for (var name in this.this)
				yield [this.this[name], name, 'this'];
		}
	}
	find(f) {
		for (var entry of this)
			if (f(...entry))
				return entry;
	}
}
module.exports = Scope;
