import * as Environment from "./Environment";
import * as Expression from "./Expression";

export function resolve<T>(this: Environment<T>, global: Environment<T>, expression: Expression.Name): ReturnType<Environment<T>['resolve']>;
export function ancestor<T>(this: Environment<T>, global: Environment<T>, depth: number): Environment<T>;
