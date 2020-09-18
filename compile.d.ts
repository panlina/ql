import * as Scope from './Scope';
import * as Environment from './Environment';
import * as Expression from './Expression';
import * as Type from './Type';
import * as Interpretation from './Interpretation';
function compile<T>(
	this: Environment<Type> & {
		scope: Scope<Type> & {
			type?: { [key: string]: Type.Object };
			table?: (type: string) => string;
		}
	},
	expression: Expression,
	interpretation: Interpretation<T>
): T;
export = compile;
