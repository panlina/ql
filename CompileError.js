class CompileError extends Error {
	constructor(expression) {
		super();
		this.expression = expression;
	}
}
class UndefinedName extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `'${this.expression.identifier}' is not defined.`; }
}
class UnresolvedReference extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `'this ${this.expression.identifier}' is not resolved.`; }
}
CompileError.UndefinedName = UndefinedName;
CompileError.UnresolvedReference = UnresolvedReference;
module.exports = CompileError;
