import Scope from './Scope';
import Environment from './Environment';
import Type from './Type';
import Expression from './Expression';
interface Interpretation<T> {
	pre(global: Environment<Type>): void;
	post(T): T;
	expression: {
		literal($value): T;
		name: {
			table($identifier: string): T;
			constant($identifier: string): T;
			name(this: Environment<Type>, $identifier: string, resolution: [Type, [number, Scope.Key]]): T;
		},
		object($property: { name: string, value: T }[]): T;
		array($element: T[]): T;
		tuple($element: T[]): T;
		find($table: string, $property: string, $id: string): T;
		field($expression: T, $property: string): T;
		element($expression: T, $index: T): T;
		call($expression: T, $argument: T): T;
		operation($operator: string, $left?: T, $right?: T): T;
		conditional($condition: T, $true: T, $false: T): T;
		filter($expression: T, $filter: T): T;
		map($expression: T, $mapper: T): T;
		limit($expression: T, $limiter: [T, T]): T;
		order($expression: T, $orderer: T, $direction?: boolean): T;
		group($expression: T, $grouper: T): T;
		distinct($expression: T): T;
		['*'](expression: Expression): T;
		bind($value: T, scope: Scope<T>, environment: number = 0): T;
	};
	constant: {
		[name: string]: Type;
	};
};
export = Interpretation;
