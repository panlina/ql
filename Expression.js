class Expression { }

class Literal extends Expression {
	constructor(value) {
		super();
		this.value = value;
	}
}

class Name extends Expression {
	constructor(identifier) {
		super();
		this.identifier = identifier;
	}
}

class Unary extends Expression {
	constructor(operator, operand) {
		super();
		this.operator = operator;
		this.operand = operand;
	}
}

class Binary extends Expression {
	constructor(operator, left, right) {
		super();
		this.operator = operator;
		this.left = left;
		this.right = right;
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
module.exports.Literal = Literal;
module.exports.Name = Name;
module.exports.Unary = Unary;
module.exports.Binary = Binary;
module.exports.Filter = Filter;
