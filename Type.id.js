function id(type) {
	var $ql = type.$ql;
	return $ql && $ql.id || 'id';
}
module.exports = id;
