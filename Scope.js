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
}
module.exports = Scope;
