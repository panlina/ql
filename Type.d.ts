type Type = 'string' | 'number' | 'boolean' | Type[] | { [key: string]: Type } | Function | Tuple;
export = Type;
export class Function {
	constructor(argument: Type, result: Type);
	argument: Type;
	result: Type;
}
export class Tuple {
	constructor(element: Type[]);
	element: Type[];
}
