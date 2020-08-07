import * as Scope from './Scope';

export = class Environment<T> {
	constructor(scope: Environment<T>['scope'], parent: Environment<T>['parent']);
	scope: Scope<T>;
	parent: Environment<T> | undefined;
	resolve(name: string): [T, [number, Scope.Key]] | undefined;
	[Symbol.iterator](): IterableIterator<Scope<T>>;
	find(
		f: (value: T, name: string, key: Key) => any,
		filter: Scope.Filter
	): [T, string, Key, number];
	ancestor(depth: number): Environment<T>;
	push(scope: Scope<T>): Environment<T>;
}
