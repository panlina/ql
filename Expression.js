class Expression {
	constructor(type) {
		this.type = type;
	}
 }

class Literal extends Expression {
	constructor(value) {
		super('literal');
		this.value = value;
	}
}

class Name extends Expression {
	constructor(identifier) {
		super('name');
		this.identifier = identifier;
	}
}

class Property extends Expression {
	constructor(expression, property) {
		super('property');
		this.expression = expression;
		this.property = property;
	}
}

class Unary extends Expression {
	constructor(operator, operand) {
		super('unary');
		this.operator = operator;
		this.operand = operand;
	}
}

class Binary extends Expression {
	constructor(operator, left, right) {
		super('binary');
		this.operator = operator;
		this.left = left;
		this.right = right;
	}
}

class Filter extends Expression {
	constructor(expression, filter) {
		super('filter');
		this.expression = expression;
		this.filter = filter;
	}
}

module.exports = Expression;
module.exports.Literal = Literal;
module.exports.Name = Name;
module.exports.Property = Property;
module.exports.Unary = Unary;
module.exports.Binary = Binary;
module.exports.Filter = Filter;
