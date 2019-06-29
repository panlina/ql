var grammar = require('./grammar');
var semantics = require('./semantics');
module.exports = text => semantics(grammar.match(text)).parse();
