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

class Object extends Expression {
	constructor(property) {
		super('object');
		this.property = property;
	}
}

class Array extends Expression {
	constructor(element) {
		super('array');
		this.element = element;
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

class Conditional extends Expression {
	constructor(condition, _true, _false) {
		super('conditional');
		this.condition = condition;
		this.true = _true;
		this.false = _false;
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

class Limit extends Expression {
	constructor(expression, limiter) {
		super('limit');
		this.expression = expression;
		this.limiter = limiter;
	}
}

class Order extends Expression {
	constructor(expression, orderer) {
		super('order');
		this.expression = expression;
		this.orderer = orderer;
	}
}

class Group extends Expression {
	constructor(expression, grouper) {
		super('group');
		this.expression = expression;
		this.grouper = grouper;
	}
}

class Distinct extends Expression {
	constructor(expression) {
		super('distinct');
		this.expression = expression;
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
module.exports.Object = Object;
module.exports.Array = Array;
module.exports.Property = Property;
module.exports.Index = Index;
module.exports.Call = Call;
module.exports.Operation = Operation;
module.exports.Conditional = Conditional;
module.exports.Filter = Filter;
module.exports.Map = Map;
module.exports.Limit = Limit;
module.exports.Order = Order;
module.exports.Group = Group;
module.exports.Distinct = Distinct;
module.exports.Comma = Comma;
