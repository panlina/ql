export = class Expression {
	constructor(type: string);
	type: string;
}

export class Name extends Expression {
	constructor(identifier: string, depth: number);
	identifier: string;
	depth: string;
}
