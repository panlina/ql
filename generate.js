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
		case 'call':
			var $expression = generate(expression.expression);
			if (precedence[expression.expression.type] > precedence[expression.type])
				$expression = `(${$expression})`;
			var argument = generate(expression.argument);
			if (precedence[expression.argument.type] >= precedence[expression.type])
				argument = `(${argument})`;
			return `${$expression} ${argument}`;
		case 'operation':
			if (expression.left) {
				var left = generate(expression.left);
				if (
					precedence[expression.left.type] > precedence[expression.type]
					||
					precedence[expression.left.type] == precedence[expression.type]
					&&
					operatorPrecedence(expression.left) > operatorPrecedence(expression)
				)
					left = `(${left})`;
			}
			if (expression.right) {
				var right = generate(expression.right);
				if (
					precedence[expression.right.type] > precedence[expression.type]
					||
					precedence[expression.right.type] == precedence[expression.type]
					&&
					operatorPrecedence(expression.right) >= operatorPrecedence(expression)
				)
					right = `(${right})`;
			}
			return `${left || ''}${expression.operator}${right || ''}`;
			function operatorPrecedence(expression) {
				return require('./operator').resolve(
					expression.operator,
					!!expression.left,
					!!expression.right
				).precedence;
			}
		case 'filter':
			var $expression = generate(expression.expression);
			if (precedence[expression.expression.type] > precedence[expression.type])
				$expression = `(${$expression})`;
			var filter = generate(expression.filter);
			if (precedence[expression.filter.type] >= precedence[expression.type])
				filter = `(${filter})`;
			return `${$expression} where ${filter}`;
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
	call: 2,
	operation: 3,
	filter: 4,
	comma: 5
};
module.exports = generate;
