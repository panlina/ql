class Expression { }

class Name extends Expression {
	constructor(identifier) {
		super();
		this.identifier = identifier;
	}
}

class Filter extends Expression {
	constructor(expression, filter) {
		super();
		this.expression = expression;
		this.filter = filter;
	}
}

module.exports = Expression;
module.exports.Name = Name;
module.exports.Filter = Filter;
