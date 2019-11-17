var assert = require('assert');
var ql = require('..');
var data, type = require('./type');
type = require('lodash.mapvalues')(type, require('../Type.parse'));
var local = require('lodash.transform')(type, (result, value, key) => {
	result[`${key}s`] = [value];
});
before(function () {
	var fs = require('fs'), path = require('path');
	var file = path.join(__dirname, 'data.json');
	return new Promise(resolve => {
		if (fs.existsSync(file))
			resolve();
		else {
			this.timeout(0);
			console.log("Downloading test data...")
			require('request')("https://github.com/typicode/jsonplaceholder/blob/master/data.json?raw=true")
				.pipe(fs.createWriteStream(file))
				.on('finish', function () {
					console.log("Download complete.");
					resolve();
				});
		}
	}).then(() => {
		data = JSON.parse(fs.readFileSync(file));
	});
});
it('(posts|!this.id>50&&(t=::posts#1.title,title<=t))#', function () {
	var q = ql.parse("(posts|!this.id>50&&(t=::posts#1.title,title<=t))#");
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
	assert(require('../Type.equals')(_function.type, 'number'));
	assert.equal(
		_function.call(new ql.Environment(new ql.Scope(data))),
		data.posts.filter(post => !(post.id > 50) && post.title <= data.posts.find(post => post.id == 1).title).length
	);
});
it('users|(posts|id>10)', function () {
	var q = ql.parse("users|(posts|id>10)");
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
	assert(require('../Type.equals')(_function.type, [type.user]));
	assert.equal(
		_function.call(new ql.Environment(new ql.Scope(data))).length,
		data.users.filter(user => data.posts.filter(post => post.userId == user.id && post.id > 10).length > 0).length
	);
});
describe('compile error', function () {
	var CompileError = require('../CompileError');
	describe('undefined name', function () {
		it('local', function () {
			var q = ql.parse("u|(posts|id>10)");
			assert.throws(() => {
				ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
			}, CompileError.UndefinedName);
		});
		it('this', function () {
			var q = ql.parse('users|(p|id>10)');
			assert.throws(() => {
				ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
			}, CompileError.UndefinedName);
		});
	});
	it('unresolved name', function () {
		var q = ql.parse('users|(this post)');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
		}, CompileError.UnresolvedReference);
	});
	it('non-object property access', function () {
		var q = ql.parse('0.id');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
		}, CompileError.NonObjectPropertyAccess);
	});
	it('property not found', function () {
		var q = ql.parse('users#1.a');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
		}, CompileError.PropertyNotFound);
	});
	it('non-array index', function () {
		var q = ql.parse('users#1#1');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
		}, CompileError.NonArrayIndex);
	});
	it('non-primitive index', function () {
		var q = ql.parse('users#(users#1)');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
		}, CompileError.NonPrimitiveIndex);
	});
});
