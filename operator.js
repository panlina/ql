var operator = [
	{ name: '+', left: false, right: true, precedence: 0 },
	{ name: '-', left: false, right: true, precedence: 0 },
	{ name: '*', left: true, right: true, precedence: 1 },
	{ name: '/', left: true, right: true, precedence: 1 },
	{ name: '+', left: true, right: true, precedence: 2 },
	{ name: '-', left: true, right: true, precedence: 2 },
	{ name: '<=', left: true, right: true, precedence: 3 },
	{ name: '=', left: true, right: true, precedence: 3 },
	{ name: '>=', left: true, right: true, precedence: 3 },
	{ name: '<', left: true, right: true, precedence: 3 },
	{ name: '!=', left: true, right: true, precedence: 3 },
	{ name: '>', left: true, right: true, precedence: 3 },
	{ name: '!', left: false, right: true, precedence: 4 },
	{ name: '&', left: true, right: true, precedence: 5 },
	{ name: '|', left: true, right: true, precedence: 5 },
	{ name: '#', left: true, right: false, precedence: -1 }
];
var group = require('lodash.groupby')(operator, 'name');
Object.defineProperty(operator, 'resolve', {
	value: function (name, left, right) {
		return group[name].find(
			operator =>
				operator.left == left
				&&
				operator.right == right
		);
	}
});
module.exports = operator;
