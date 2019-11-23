function generate(expression) {
	switch (expression.type) {
		case 'literal':
			return JSON.stringify(expression.value);
		case 'name':
			return `${expression.global ? "::" : ''}${expression.identifier}`;
		case 'this':
			return `this ${expression.identifier}`;
		case 'property':
			var $expression = generate(expression.expression);
			if (precedence[expression.expression.type] > precedence[expression.type])
				$expression = `(${$expression})`;
			return `${$expression}.${expression.property}`;
		case 'index':
			var $expression = generate(expression.expression);
			if (precedence[expression.expression.type] > precedence[expression.type])
				$expression = `(${$expression})`;
			var index = generate(expression.index);
			if (precedence[expression.index.type] >= precedence[expression.type])
				index = `(${index})`;
			return `${$expression}#${index}`;
		case 'unary':
			var operand = generate(expression.operand);
			if (
				precedence[expression.operand.type] > precedence[expression.type]
				||
				precedence[expression.operand.type] == precedence[expression.type]
				&&
				operator[expression.operand.operator] > operator[expression.operator]
			)
				operand = `(${operand})`;
			if (expression.operator == '#')
				return `${operand}${expression.operator}`;
			return `${expression.operator}${operand}`;
		case 'binary':
			var left = generate(expression.left);
			if (
				precedence[expression.left.type] > precedence[expression.type]
				||
				precedence[expression.left.type] == precedence[expression.type]
				&&
				operator[expression.left.operator] > operator[expression.operator]
			)
				left = `(${left})`;
			var right = generate(expression.right);
			if (
				precedence[expression.right.type] > precedence[expression.type]
				||
				precedence[expression.right.type] == precedence[expression.type]
				&&
				operator[expression.right.operator] >= operator[expression.operator]
			)
				right = `(${right})`;
			return `${left}${expression.operator}${right}`;
		case 'filter':
			var $expression = generate(expression.expression);
			if (precedence[expression.expression.type] > precedence[expression.type])
				$expression = `(${$expression})`;
			var filter = generate(expression.filter);
			if (precedence[expression.filter.type] >= precedence[expression.type])
				filter = `(${filter})`;
			return `${$expression}|${filter}`;
		case 'comma':
			var value = generate(expression.head.value);
			if (precedence[expression.head.value.type] >= precedence[expression.type])
				value = `(${value})`;
			var body = generate(expression.body);
			if (precedence[expression.body.type] > precedence[expression.type])
				body = `(${body})`;
			return `${expression.head.name}=${value},${body}`;
	}
}
var precedence = {
	literal: 0,
	name: 0,
	this: 0,
	property: 1,
	index: 1,
	unary: 2,
	binary: 2,
	filter: 3,
	comma: 4
};
var operator = {
	'*': 0,
	'/': 0,
	'+': 1,
	'-': 1,
	'<=': 2,
	'=': 2,
	'>=': 2,
	'<': 2,
	'!=': 2,
	'>': 2,
	'!': 3,
	'&&': 4,
	'||': 4,
	'#': -1
};
module.exports = generate;
