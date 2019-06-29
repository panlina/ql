var fs = require('fs');
var path = require('path');
var ohm = require('ohm-js');
module.exports = ohm.grammar(fs.readFileSync(path.join(__dirname, 'ql.ohm'), 'utf8'));
