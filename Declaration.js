class Declaration {
	constructor(name, statement) {
		this.name = name;
		this.statement = statement;
	}
}
class Statement { }
class Property extends Statement {
	constructor(name, { type: type, value: value }) {
		super();
		this.name = name;
		if (type) this.type = type;
		if (value) this.value = value;
	}
}
class Id extends Statement {
	constructor(property) {
		super();
		this.property = property;
	}
}
module.exports = Declaration;
module.exports.Statement = Statement;
module.exports.Statement.Property = Property;
module.exports.Statement.Id = Id;
