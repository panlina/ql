class Expression {
	constructor(type: string);
	type: string;
}

export = Expression;

export class Name extends Expression {
	constructor(identifier: string, depth: number);
	identifier: string;
	depth: string;
}
