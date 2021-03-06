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
class NonPrimitiveId extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `non-primitive id.`; }
}
class NonObjectPropertyAccess extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `cannot access property '${this.expression.identifier}' of non-object.`; }
}
class PropertyNotFound extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `property '${this.expression.property}' is not found.`; }
}
class NonArrayOrTupleIndex extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `cannot index non-array-or-tuple.`; }
}
class NonPrimitiveIndex extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `non-primitive cannot index.`; }
}
class NonLiteralTupleIndex extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `non-literal cannot index tuple.`; }
}
class WrongArgumentType extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `wrong argument type.`; }
}
class NonEqualConditionalType extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `true and false must be of same type.`; }
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
	get message() { return `limiter must be tuple of start followed by length, both constants.`; }
}
class NonArrayOrder extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `cannot order non-array.`; }
}
class NonPrimitiveOrder extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `non-primitive cannot order.`; }
}
class NonArrayGroup extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `cannot group non-array.`; }
}
class NonPrimitiveGroup extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `cannot group by non-primitive.`; }
}
class NonArrayDistinct extends CompileError {
	constructor(expression) { super(expression); }
	get message() { return `cannot distinct non-array.`; }
}
CompileError.UndefinedName = UndefinedName;
CompileError.UnresolvedReference = UnresolvedReference;
CompileError.HeterogeneousArray = HeterogeneousArray;
CompileError.NonPrimitiveId = NonPrimitiveId;
CompileError.NonObjectPropertyAccess = NonObjectPropertyAccess;
CompileError.PropertyNotFound = PropertyNotFound;
CompileError.NonArrayOrTupleIndex = NonArrayOrTupleIndex;
CompileError.NonPrimitiveIndex = NonPrimitiveIndex;
CompileError.NonLiteralTupleIndex = NonLiteralTupleIndex;
CompileError.WrongArgumentType = WrongArgumentType;
CompileError.NonEqualConditionalType = NonEqualConditionalType;
CompileError.NonArrayFilter = NonArrayFilter;
CompileError.NonArrayMap = NonArrayMap;
CompileError.NonArrayLimit = NonArrayLimit;
CompileError.InvalidLimiter = InvalidLimiter;
CompileError.NonArrayOrder = NonArrayOrder;
CompileError.NonPrimitiveOrder = NonPrimitiveOrder;
CompileError.NonArrayGroup = NonArrayGroup;
CompileError.NonPrimitiveGroup = NonPrimitiveGroup;
CompileError.NonArrayDistinct = NonArrayDistinct;
module.exports = CompileError;
