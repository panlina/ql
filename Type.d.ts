import * as Expression from "./Expression";
type Type =
	'string' | 'number' | 'boolean' |
	Type[] |
	Object |
	Function |
	Tuple;
export = Type;
export type Object = {
	$ql?: { id?: string; };
	[key: string]: { type: Type; } | { value: Expression; };
};
export class Function {
	constructor(argument: Type, result: Type);
	argument: Type;
	result: Type;
}
export class Tuple {
	constructor(element: Type[]);
	element: Type[];
}
