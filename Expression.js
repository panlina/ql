class Expression { }

class Name extends Expression {
	constructor(identifier) {
		super();
		this.identifier = identifier;
	}
}

class Add extends Expression {
	constructor(operator, left, right) {
		super();
		this.operator = operator;
		this.left = left;
		this.right = right;
	}
}

class Compare extends Expression {
	constructor(operator, left, right) {
		super();
		this.operator = operator;
		this.left = left;
		this.right = right;
	}
}

class Logic extends Expression {
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
module.exports.Name = Name;
module.exports.Add = Add;
module.exports.Compare = Compare;
module.exports.Logic = Logic;
module.exports.Filter = Filter;
