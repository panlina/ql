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

class Call extends Expression {
	constructor(expression, argument) {
		super('call');
		this.expression = expression;
		this.argument = argument;
	}
}

class Operation extends Expression {
	constructor(operator, left, right) {
		super('operation');
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

class Map extends Expression {
	constructor(expression, mapper) {
		super('map');
		this.expression = expression;
		this.mapper = mapper;
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
module.exports.Call = Call;
module.exports.Operation = Operation;
module.exports.Filter = Filter;
module.exports.Map = Map;
module.exports.Comma = Comma;
