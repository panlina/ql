import * as Scope from './Scope';
import * as Environment from './Environment';
import * as Expression from './Expression';
import * as Type from './Type';
import * as Intepretation from './Intepretation';
function compile<T>(
	this: Environment<Type> & {
		scope: Scope<Type> & {
			type?: { [key: string]: Type.Object };
			table?: (type: string) => string;
		}
	},
	expression: Expression,
	intepretation: Intepretation<T>
): T;
export = compile;
