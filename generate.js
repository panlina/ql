function generate(expression) {
	switch (expression.type) {
		case 'literal':
			return JSON.stringify(expression.value);
		case 'name':
			return `${expression.global ? "::" : ''}${expression.identifier}`;
		case 'this':
			return `this ${expression.identifier}`;
		case 'property':
			return `(${generate(expression.expression)}).${expression.property}`;
		case 'index':
			return `(${generate(expression.expression)})#(${generate(expression.index)})`;
		case 'unary':
			if (expression.operator == '#')
				return `(${generate(expression.operand)})#`;
			return `${expression.operator}(${generate(expression.operand)})`;
		case 'binary':
			return `(${generate(expression.left)})${expression.operator}(${generate(expression.right)}`;
		case 'filter':
			return `(${generate(expression.expression)})|(${generate(expression.filter)})`;
		case 'comma':
			return `${expression.head.name}=(${generate(expression.head.value)}),(${generate(expression.body)})`;
	}
}
module.exports = generate;
