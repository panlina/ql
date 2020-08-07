export type Key = 'local' | 'this';
export type Filter = { key?: Key, name?: string };
export type Entry<T> = [T, string, Key];
export = class Scope<T> implements Iterable<T> {
	constructor(local: Scope<T>['local'], _this: Scope<T>['this']);
	local: { [key: string]: T; };
	this: T | undefined;
	resolve(name: string): [T, Key] | undefined;
	[Symbol.iterator](filter: Filter = {}): IterableIterator<Entry<T>>;
	find(
		f: (...entry: Entry<T>) => any,
		filter: Filter
	): [T, string, Key];
};
