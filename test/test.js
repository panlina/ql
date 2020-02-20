var fs = require('fs');
var path = require('path');
var assert = require('assert');
var ql = require('..');
var data, type = ql.parse(fs.readFileSync(path.join(__dirname, 'type.ql'), 'utf8'), 'Declarations');
type = require('../Type.compile')(type);
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
it('(posts where !-this.id<-50&(t=post#1.title,length title<=length t))#', function () {
	var q = ql.parse("(posts where !-this.id<-50&(t=post#1.title,length title<=length t))#");
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
	assert(require('../Type.equals')(_function.type, 'number'));
	assert.equal(
		_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
		data.posts.filter(post => !(post.id > 50) && post.title.length <= data.posts.find(post => post.id == 1).title.length).length
	);
});
it('users where (posts where id>10)', function () {
	var q = ql.parse("users where (posts where id>10)");
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
	assert(require('../Type.equals')(_function.type, [type.user]));
	assert.equal(
		_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))).length,
		data.users.filter(user => data.posts.filter(post => post.userId == user.id && post.id > 10).length > 0).length
	);
});
it('users map (albums map photos)', function () {
	var q = ql.parse("users map (albums map photos)");
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
	assert(require('../Type.equals')(_function.type, [[[type.photo]]]));
	assert.deepEqual(
		_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
		data.users.map(user => data.albums.filter(album => album.userId == user.id).map(album => data.photos.filter(photo => photo.albumId == album.id)))
	);
});
describe('object', function () {
	it('{a:"a",b:posts#}', function () {
		var q = ql.parse('{a:"a",b:posts#}');
		var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		assert(require('../Type.equals')(_function.type, { a: { type: 'string' }, b: { type: 'number' } }));
		assert.deepEqual(
			_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
			{ a: "a", b: data.posts.length }
		);
	});
	it('{a:"a",b:posts#}.b', function () {
		var q = ql.parse('{a:"a",b:posts#}.b');
		var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		assert(require('../Type.equals')(_function.type, 'number'));
		assert.deepEqual(
			_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
			data.posts.length
		);
	});
	it('users map {user:name,posts:posts#}', function () {
		var q = ql.parse('users map {user:name,posts:posts#}');
		var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		assert(require('../Type.equals')(_function.type, [{ user: { type: 'string' }, posts: { type: 'number' } }]));
		assert.deepEqual(
			_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
			data.users.map(user => ({ user: user.name, posts: data.posts.filter(post => post.userId == user.id).length }))
		);
	});
});
it('{"a",posts#}', function () {
	var q = ql.parse('{"a",posts#}');
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
	assert(require('../Type.equals')(_function.type, new (require('../Type').Tuple)(['string', 'number'])));
	assert.deepEqual(
		_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
		["a", data.posts.length]
	);
});
it('posts@0.title', function () {
	var q = ql.parse('posts@0.title');
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
	assert(require('../Type.equals')(_function.type, 'string'));
	assert.equal(
		_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
		data.posts[0].title
	);
});
it('{post#1,user#1}@0', function () {
	var q = ql.parse('{post#1,user#1}@0');
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
	assert(require('../Type.equals')(_function.type, type.post));
	assert.equal(
		_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
		data.posts.find(post => post.id == 1)
	);
});
it('1.1+2.2', function () {
	var q = ql.parse("1.1+2.2");
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
	assert(require('../Type.equals')(_function.type, 'number'));
	assert.equal(
		_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
		1.1 + 2.2
	);
});
it('[0,0] map 0<1|1<2?"a":"b"', function () {
	var q = ql.parse('[0,0] map 0<1|1<2?"a":"b"');
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
	assert(require('../Type.equals')(_function.type, ['string']));
	assert.deepEqual(
		_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
		[0, 0].map(() => 0 < 1 || 1 < 2 ? "a" : "b")
	);
});
it('[0,1] map this+1 where this>1', function () {
	var q = ql.parse('[0,1] map this+1 where this>1');
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
	assert(require('../Type.equals')(_function.type, ['number']));
	assert.deepEqual(
		_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
		[2]
	);
});
it('[0,1,2,3] limit [1,2]', function () {
	var q = ql.parse('[0,1,2,3] limit [1,2]');
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
	assert(require('../Type.equals')(_function.type, ['number']));
	assert.deepEqual(
		_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
		[1, 2]
	);
});
it('albums order title', function () {
	var q = ql.parse('albums order title');
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
	assert(require('../Type.equals')(_function.type, [type.album]));
	assert.deepEqual(
		_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
		data.albums.sort((a, b) => a.title < b.title ? -1 : a.title > b.title ? 1 : 0)
	);
});
describe('group', function () {
	it('posts group userId', function () {
		var q = ql.parse("posts group userId");
		var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		assert(require('../Type.equals')(_function.type, [{ key: { type: 'number' }, value: { type: [type.post] } }]));
		assert.deepEqual(
			_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
			Object.entries(require('lodash.groupby')(data.posts, post => post.userId)).map(([key, value]) => ({ key: key, value: value }))
		);
	});
	it('posts group userId map {user:key,posts:value#}', function () {
		var q = ql.parse("posts group userId map {user:key,posts:value#}");
		var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		assert(require('../Type.equals')(_function.type, [{ user: { type: 'number' }, posts: { type: 'number' } }]));
		assert.deepEqual(
			_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
			Object.entries(require('lodash.groupby')(data.posts, post => post.userId)).map(([key, value]) => ({ key: key, value: value })).map(({ key: key, value: value }) => ({ user: key, posts: value.length }))
		);
	});
});
it('distinct', function () {
	var q = ql.parse('distinct [{a:0,b:1},{a:0,b:1},{a:1,b:2}]');
	var _function = ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
	assert(require('../Type.equals')(_function.type, [{ a: { type: 'number' }, b: { type: 'number' } }]));
	assert.deepEqual(
		_function.call(new ql.Environment(Object.assign(new ql.Scope({}), { table: data }))),
		require('lodash.uniqwith')([{ a: 0, b: 1 }, { a: 0, b: 1 }, { a: 1, b: 2 }], require('lodash.isequal'))
	);
});
describe('compile error', function () {
	var CompileError = require('../CompileError');
	describe('undefined name', function () {
		it('local', function () {
			var q = ql.parse("u where (posts where id>10)");
			assert.throws(() => {
				ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
			}, CompileError.UndefinedName);
		});
		it('this', function () {
			var q = ql.parse('users where (p where id>10)');
			assert.throws(() => {
				ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
			}, CompileError.UndefinedName);
		});
		describe('type', function () {
			it('this', function () {
				var q = ql.parse('users where this p');
				assert.throws(() => {
					ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
				}, CompileError.UndefinedName);
			});
			it('id', function () {
				var q = ql.parse('u#1');
				assert.throws(() => {
					ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
				}, CompileError.UndefinedName);
			});
		});
	});
	it('unresolved reference', function () {
		var q = ql.parse('users where this post');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.UnresolvedReference);
	});
	it('heterogeneous array', function () {
		var q = ql.parse('[0,"abc"]');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.HeterogeneousArray);
	});
	it('non-primitive id', function () {
		var q = ql.parse('user#(user#1)');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.NonPrimitiveId);
	});
	it('non-object property access', function () {
		var q = ql.parse('user#1.id.id');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.NonObjectPropertyAccess);
	});
	it('property not found', function () {
		var q = ql.parse('user#1.a');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.PropertyNotFound);
	});
	it('non-array-or-tuple index', function () {
		var q = ql.parse('user#1@0');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.NonArrayOrTupleIndex);
	});
	it('non-primitive index', function () {
		var q = ql.parse('users@(user#1)');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.NonPrimitiveIndex);
	});
	it('non-literal tuple index', function () {
		var q = ql.parse('{post#1,user#1}@(0+0)');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.NonLiteralTupleIndex);
	});
	it('wrong argument type', function () {
		var q = ql.parse('length 0');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.WrongArgumentType);
	});
	it('non-equal conditional type', function () {
		var q = ql.parse('0?0:"a"');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.NonEqualConditionalType);
	});
	it('non-array filter', function () {
		var q = ql.parse('user#1 where 0');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.NonArrayFilter);
	});
	it('non-array map', function () {
		var q = ql.parse('user#1 map 0');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.NonArrayMap);
	});
	it('non-array limit', function () {
		var q = ql.parse('user#1 limit [0,0]');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.NonArrayLimit);
	});
	it('invalid limiter', function () {
		var q = ql.parse('users limit "0"');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.InvalidLimiter);
	});
	it('non-array order', function () {
		var q = ql.parse('user#1 order 0');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.NonArrayOrder);
	});
	it('non-primitive order', function () {
		var q = ql.parse('users order user#1');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.NonPrimitiveOrder);
	});
	it('non-array group', function () {
		var q = ql.parse('user#1 group 0');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.NonArrayGroup);
	});
	it('non-primitive group', function () {
		var q = ql.parse('users group posts');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.NonPrimitiveGroup);
	});
	it('non-array distinct', function () {
		var q = ql.parse('distinct user#1');
		assert.throws(() => {
			ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
		}, CompileError.NonArrayDistinct);
	});
	describe('operator', function () {
		it('unary', function () {
			var q = ql.parse('user#1#');
			assert.throws(() => {
				ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
			}, { message: "operand of # must be array." });
		});
		it('binary', function () {
			var q = ql.parse('user#1+1');
			assert.throws(() => {
				ql.compile.call(new ql.Environment(Object.assign(new ql.Scope({}), { type: type, table: type => `${type}s` })), q);
			}, { message: "operands of + must be numbers or strings." });
		});
	});
	describe('generate', function () {
		it("(length (123+user#456.number)).x@789", function () {
			var q = ql.parse("(length (123+user#456.number)).x@789");
			assert.equal(ql.generate(q), "(length (123+user#456.number)).x@789");
		});
		it("[{a:0,b:a=0,a in b},1] map (this+1 limit [0,10])", function () {
			var q = ql.parse('[{a:0,b:a=0,a in b},1] map (this+1 limit [0,10])');
			assert.equal(ql.generate(q), "[{a:0,b:a=0,a in b},1] map (this+1 limit [0,10])");
		});
		it("distinct ([{0,(a=0,a in b)},1] order 0?0?1:2:1+a#(a#2) desc)", function () {
			var q = ql.parse('distinct ([{0,(a=0,a in b)},1] order 0?0?1:2:1+a#(a#2) desc)');
			assert.equal(ql.generate(q), "distinct ([{0,(a=0,a in b)},1] order 0?0?1:2:1+a#(a#2) desc)");
		});
	});
});
