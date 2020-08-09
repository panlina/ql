import * as Expression from "./Expression";
class Declaration {
	constructor(name: string, statement: Statement[]);
	name: string;
	statement: Statement[];
}
export = Declaration;
export class Statement { }
export namespace Statement {
	export class Property extends Statement {
		constructor(name: string, statement: { type: string } | { value: Expression });
		type?: string;
		value?: Expression;
	}
	export class Id extends Statement {
		constructor(property: string);
		property: string;
	}
}
