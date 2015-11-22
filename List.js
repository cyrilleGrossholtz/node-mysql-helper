var Boom = require('boom');

var NAME = exports.NAME = "LIST";
var 

exports.innerJoin = function(otherModel) {
	var res = [];
	switch (otherModel.NAME) {
		case 'USER':
			res.push("USER_HAS_LIST");
			res.push(NAME);
			break;
		default:
			return Boom.badImplementation("No inner join defined for table [" + NAME + "] for name [" + otherModel.NAME + "]");
			break;
	}
	return res;
};