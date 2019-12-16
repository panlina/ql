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
it('(posts where !-this.id<-50&(t=::posts#1.title,length title<=length t))#', function () {
	var q = ql.parse("(posts where !-this.id<-50&(t=::posts#1.title,length title<=length t))#");
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
	assert(require('../Type.equals')(_function.type, 'number'));
	assert.equal(
		_function.call(new ql.Environment(new ql.Scope(data))),
		data.posts.filter(post => !(post.id > 50) && post.title.length <= data.posts.find(post => post.id == 1).title.length).length
	);
});
it('users where (posts where id>10)', function () {
	var q = ql.parse("users where (posts where id>10)");
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
	assert(require('../Type.equals')(_function.type, [type.user]));
	assert.equal(
		_function.call(new ql.Environment(new ql.Scope(data))).length,
		data.users.filter(user => data.posts.filter(post => post.userId == user.id && post.id > 10).length > 0).length
	);
});
describe('group', function () {
	it('(posts group userId)#1', function () {
		var q = ql.parse("(posts group userId)#1");
		var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
		assert(require('../Type.equals')(_function.type, [type.post]));
		assert.deepEqual(
			_function.call(new ql.Environment(new ql.Scope(data))),
			require('lodash.groupby')(data.posts, post => post.userId)[1]
		);
	});
	it('posts group userId where this#=10', function () {
		var q = ql.parse("(posts group userId) where (this#=10)");
		var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
		assert(require('../Type.equals')(_function.type, new (require('../Type').Group)('number', type.post)));
		assert.deepEqual(
			_function.call(new ql.Environment(new ql.Scope(data))),
			require('../filterObject')(require('lodash.groupby')(data.posts, post => post.userId), value => value.length == 10)
		);
	});
	it('(posts group userId)#', function () {
		var q = ql.parse("(posts group userId)#");
		var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
		assert(require('../Type.equals')(_function.type, 'number'));
		assert.deepEqual(
			_function.call(new ql.Environment(new ql.Scope(data))),
			Object.keys(require('lodash.groupby')(data.posts, post => post.userId)).length
		);
	});
	it('posts group userId group this#', function () {
		var q = ql.parse("posts group userId group this#");
		var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
		assert(require('../Type.equals')(_function.type, new (require('../Type').Group)('number', [type.post])));
		assert.deepEqual(
			_function.call(new ql.Environment(new ql.Scope(data))),
			require('lodash.groupby')(require('lodash.groupby')(data.posts, post => post.userId), group => group.length)
		);
	});
});
describe('compile error', function () {
	var CompileError = require('../CompileError');
	describe('undefined name', function () {
		it('local', function () {
			var q = ql.parse("u where (posts where id>10)");
			assert.throws(() => {
				ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
			}, CompileError.UndefinedName);
		});
		it('this', function () {
			var q = ql.parse('users where (p where id>10)');
			assert.throws(() => {
				ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
			}, CompileError.UndefinedName);
		});
	});
	it('unresolved reference', function () {
		var q = ql.parse('users where this post');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
		}, CompileError.UnresolvedReference);
	});
	it('non-object property access', function () {
		var q = ql.parse('users#1.id.id');
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
	it('wrong argument type', function () {
		var q = ql.parse('length 0');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
		}, CompileError.WrongArgumentType);
	});
	it('non-array filter', function () {
		var q = ql.parse('users#1 where 0');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
		}, CompileError.NonArrayFilter);
	});
	it('non-array group', function () {
		var q = ql.parse('users#1 group 0');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
		}, CompileError.NonArrayGroup);
	});
	it('non-primitive group', function () {
		var q = ql.parse('users group posts');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
		}, CompileError.NonPrimitiveGroup);
	});
	describe('operator', function () {
		it('unary', function () {
			var q = ql.parse('users#1#');
			assert.throws(() => {
				ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
			}, { message: "operand of # must be array." });
		});
		it('binary', function () {
			var q = ql.parse('users#1+1');
			assert.throws(() => {
				ql.compile.call(new ql.Environment(Object.assign(new ql.Scope(local), { type: type })), q);
			}, { message: "operands of + must be numbers or strings." });
		});
	});
});
