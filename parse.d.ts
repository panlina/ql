import * as Declaration from "./Declaration";
import * as Expression from "./Expression";
function parse(text: string): Expression;
function parse(text: string, startRule: 'Expression'): Expression;
function parse(text: string, startRule: 'Declaration'): Declaration;
function parse(text: string, startRule: 'Declarations'): Declaration[];
export = parse;
