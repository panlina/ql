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
	constructor(identifier, depth) {
		super('name');
		this.identifier = identifier;
		this.depth = depth;
	}
}

class This extends Expression {
	constructor(identifier) {
		super('this');
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

class Index extends Expression {
	constructor(expression, index) {
		super('index');
		this.expression = expression;
		this.index = index;
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

class Comma extends Expression {
	constructor(head, body) {
		super('comma');
		this.head = head;
		this.body = body;
	}
}

module.exports = Expression;
module.exports.Literal = Literal;
module.exports.Name = Name;
module.exports.This = This;
module.exports.Property = Property;
module.exports.Index = Index;
module.exports.Unary = Unary;
module.exports.Binary = Binary;
module.exports.Filter = Filter;
module.exports.Comma = Comma;
