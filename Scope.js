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
	*[Symbol.iterator]({ key, name } = {}) {
		if (key != 'this')
			if (name !== undefined) {
				if (name in this.local)
					yield [this.local[name], name, 'local'];
			} else
				for (let name in this.local)
					yield [this.local[name], name, 'local'];
		if (this.this) {
			if (key != 'this')
				if (name !== undefined) {
					if (name == 'this')
						yield [this.this, 'this', 'local'];
				} else
					yield [this.this, 'this', 'local'];
			if (key != 'local')
				if (name !== undefined) {
					if (name in this.this)
						yield [this.this[name], name, 'this'];
				} else
					for (let name in this.this)
						yield [this.this[name], name, 'this'];
		}
	}
	find(f, filter) {
		for (var entry of this[Symbol.iterator](filter))
			if (f(...entry))
				return entry;
	}
}
module.exports = Scope;
