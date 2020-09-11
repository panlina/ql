import * as Intepretation from "./Intepretation";
import * as Scope from './Scope';
import * as Environment from './Environment';
type Table = {
	[name: string];
};
type Function = (this: Environment<any> & {
	scope: Scope<any> & {
		table?: { [name: string]: Table };
	};
}) => any;
var intepretation: Intepretation<Function>;
export = intepretation;
