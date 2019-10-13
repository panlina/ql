var assert = require('assert');
var ql = require('..');
var data, type = require('./type');
type = require('lodash.mapvalues')(type, require('../Type.parse'));
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
it('', function () {
	var q = ql.parse("posts|!this.id>50&&(t=::posts#1.title,title<=t)");
	var _function = ql.compile.call(new ql.Environment(new ql.Scope(type)), q);
	assert(require('../Type.equals')(_function.type, type.posts));
	assert.equal(
		_function.call(new ql.Environment(new ql.Scope(data))).length,
		data.posts.filter(post => !(post.id > 50) && post.title <= data.posts.find(post => post.id == 1).title).length
	);
});
it('', function () {
	var q = ql.parse("users|(posts|id>10)");
	var _function = ql.compile.call(new ql.Environment(new ql.Scope(type)), q);
	assert(require('../Type.equals')(_function.type, type.users));
	assert.equal(
		_function.call(new ql.Environment(new ql.Scope(data))).length,
		data.users.filter(user => data.posts.filter(post => post.userId == user.id && post.id > 10).length > 0).length
	);
});
