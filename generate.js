function generate(expression) {
	switch (expression.type) {
		case 'literal':
			return JSON.stringify(expression.value);
		case 'name':
			return `${expression.global ? "::" : ''}${expression.identifier}`;
		case 'this':
			return `this ${expression.identifier}`;
		case 'object':
			return `{${expression.property.map(property => `${property.name}:${generate(property.value)}`).join(',')}}`;
		case 'array':
			return `[${expression.element.map(element => generate(element)).join(',')}]`;
		case 'tuple':
			return `{${expression.element.map(
				element => {
					var $element = generate(element);
					if (element.type == 'comma')
						$element = `(${$element})`
					return $element;
				}
			).join(',')}}`;
		case 'id':
			var id = generate(expression.id);
			if (precedence[expression.id.type] >= precedence[expression.type])
				id = `(${id})`;
			return `${expression.identifier}#${id}`;
		case 'property':
			var $expression = generate(expression.expression);
			if (precedence[expression.expression.type] > precedence[expression.type])
				$expression = `(${$expression})`;
			return `${$expression}.${expression.property}`;
		case 'element':
			var $expression = generate(expression.expression);
			if (precedence[expression.expression.type] > precedence[expression.type])
				$expression = `(${$expression})`;
			var $index = generate(expression.index);
			if (precedence[expression.index.type] >= precedence[expression.type])
				$index = `(${$index})`;
			return `${$expression}@${$index}`;
		case 'call':
			var $expression = generate(expression.expression);
			if (precedence[expression.expression.type] >= precedence[expression.type])
				$expression = `(${$expression})`;
			var argument = generate(expression.argument);
			if (precedence[expression.argument.type] > precedence[expression.type])
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
			var operator = expression.operator;
			if (operator == 'in')
				operator = ` ${operator} `;
			return `${left || ''}${operator}${right || ''}`;
			function operatorPrecedence(expression) {
				return require('./operator').resolve(
					expression.operator,
					!!expression.left,
					!!expression.right
				).precedence;
			}
		case 'conditional':
			var $condition = generate(expression.condition);
			if (precedence[expression.condition.type] > precedence[expression.type])
				$condition = `(${$condition})`;
			var $true = generate(expression.true);
			if (precedence[expression.true.type] > precedence[expression.type])
				$true = `(${$true})`;
			var $false = generate(expression.false);
			if (precedence[expression.false.type] > precedence[expression.type])
				$false = `(${$false})`;
			return `${$condition}?${$true}:${$false}`;
		case 'filter':
			var $expression = generate(expression.expression);
			if (precedence[expression.expression.type] > precedence[expression.type])
				$expression = `(${$expression})`;
			var filter = generate(expression.filter);
			if (precedence[expression.filter.type] >= precedence[expression.type])
				filter = `(${filter})`;
			return `${$expression} where ${filter}`;
		case 'map':
			var $expression = generate(expression.expression);
			if (precedence[expression.expression.type] > precedence[expression.type])
				$expression = `(${$expression})`;
			var mapper = generate(expression.mapper);
			if (precedence[expression.mapper.type] >= precedence[expression.type])
				mapper = `(${mapper})`;
			return `${$expression} map ${mapper}`;
		case 'limit':
			var $expression = generate(expression.expression);
			if (precedence[expression.expression.type] > precedence[expression.type])
				$expression = `(${$expression})`;
			var limiter = generate(expression.limiter);
			if (precedence[expression.limiter.type] >= precedence[expression.type])
				limiter = `(${limiter})`;
			return `${$expression} limit ${limiter}`;
		case 'order':
			var $expression = generate(expression.expression);
			if (precedence[expression.expression.type] > precedence[expression.type])
				$expression = `(${$expression})`;
			var orderer = generate(expression.orderer);
			if (precedence[expression.orderer.type] >= precedence[expression.type])
				orderer = `(${orderer})`;
			if (expression.direction != undefined)
				var $direction = ` ${{ false: "asc", true: "desc" }[expression.direction]}`;
			return `${$expression} order ${orderer}${$direction || ''}`;
		case 'group':
			var $expression = generate(expression.expression);
			if (precedence[expression.expression.type] > precedence[expression.type])
				$expression = `(${$expression})`;
			var grouper = generate(expression.grouper);
			if (precedence[expression.grouper.type] >= precedence[expression.type])
				grouper = `(${grouper})`;
			return `${$expression} group ${grouper}`;
		case 'distinct':
			var $expression = generate(expression.expression);
			if (precedence[expression.expression.type] >= precedence[expression.type])
				$expression = `(${$expression})`;
			return `distinct ${$expression}`;
		case 'comma':
			var value = generate(expression.head.value);
			if (precedence[expression.head.value.type] >= precedence[expression.type])
				value = `(${value})`;
			var body = generate(expression.body);
			if (precedence[expression.body.type] > precedence[expression.type])
				body = `(${body})`;
			return `${expression.head.name}=${value},${body}`;
		case 'placeholder':
			return `%${expression.name}%`;
	}
}
var precedence = {
	literal: 0,
	name: 0,
	this: 0,
	id: 1,
	property: 2,
	element: 2,
	call: 3,
	operation: 4,
	conditional: 5,
	filter: 6,
	map: 6,
	limit: 6,
	order: 6,
	group: 6,
	distinct: 6,
	comma: 7
};
module.exports = generate;
