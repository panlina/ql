class Expression { }

class Name extends Expression {
	constructor(identifier) {
		super();
		this.identifier = identifier;
	}
}

module.exports = Expression;
module.exports.Name = Name;
