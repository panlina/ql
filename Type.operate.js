function operate(operator, left, right) {
	switch (operator) {
		case '*':
		case '/':
			if (left != 'number' || right != 'number')
				throw new Error(`operands of ${operator} must be numbers.`);
			return 'number';
		case '+':
			if (left != undefined) {
				if (left != 'number' && left != 'string' || right != 'number' && right != 'string')
					throw new Error(`operands of + must be numbers or strings.`);
				if (left != right)
					throw new Error(`operands of + must be both numbers or both strings.`);
			} else
				if (right != 'number')
					throw new Error(`operand of + must be number.`);
			return left;
		case '-':
			if (left != undefined) {
				if (left != 'number' || right != 'number')
					throw new Error(`operands of - must be numbers.`);
			} else
				if (right != 'number')
					throw new Error(`operand of - must be number.`);
			return 'number';
		case '<=':
		case '>=':
		case '<':
		case '>':
			if (left != 'number' && left != 'string' || right != 'number' && right != 'string')
				throw new Error(`operands of ${operator} must be numbers or strings.`);
			if (left != right)
				throw new Error(`operands of ${operator} must be both numbers or both strings.`);
			return 'boolean';
		case '!=':
		case '=':
			if (left != right)
				throw new Error(`operands of ${operator} must be of same type.`);
			return 'boolean';
		case '!':
		case '&':
		case '|':
			return 'boolean';
		case '#':
			if (!(left instanceof Array || left instanceof require('./Type').Group))
				throw new Error(`operand of # must be array.`);
			return 'number';
	}
}
module.exports = operate;
