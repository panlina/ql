import * as Declaration from './Declaration';
import * as Type from './Type';
function compile(declarations: Declaration[]): { [key: string]: Type.Object };
export = compile;
