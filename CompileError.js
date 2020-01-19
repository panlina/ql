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
class HeterogeneousArray extends CompileError{
	constructor(expression) { super(expression); }
	get message() { return `array elements must be of same type.`;}
}
class NonObjectPropertyAccess extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `cannot access property '${this.expression.identifier}' of non-object.`; }
}
class PropertyNotFound extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `property '${this.expression.property}' is not found.`; }
}
class NonArrayIndex extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `cannot index non-array.`; }
}
class NonPrimitiveIndex extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `non-primitive cannot index.`; }
}
class WrongArgumentType extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `wrong argument type.`; }
}
class NonArrayFilter extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `cannot filter non-array.`; }
}
class NonArrayMap extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `cannot map non-array.`; }
}
class NonArrayLimit extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `cannot limit non-array.`; }
}
class InvalidLimiter extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `limiter must be array of start followed by length, both constants.`; }
}
class NonArrayOrder extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `cannot order non-array.`; }
}
class NonPrimitiveOrder extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `non-primitive cannot order.`; }
}
CompileError.UndefinedName = UndefinedName;
CompileError.UnresolvedReference = UnresolvedReference;
CompileError.HeterogeneousArray = HeterogeneousArray;
CompileError.NonObjectPropertyAccess = NonObjectPropertyAccess;
CompileError.PropertyNotFound = PropertyNotFound;
CompileError.NonArrayIndex = NonArrayIndex;
CompileError.NonPrimitiveIndex = NonPrimitiveIndex;
CompileError.WrongArgumentType = WrongArgumentType;
CompileError.NonArrayFilter = NonArrayFilter;
CompileError.NonArrayMap = NonArrayMap;
CompileError.NonArrayLimit = NonArrayLimit;
CompileError.InvalidLimiter = InvalidLimiter;
CompileError.NonArrayOrder = NonArrayOrder;
CompileError.NonPrimitiveOrder = NonPrimitiveOrder;
module.exports = CompileError;
