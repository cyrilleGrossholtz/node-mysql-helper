var Boom = require('boom');

var NAME = exports.NAME = "LIST";


exports.innerJoin = function(otherModel) {

	switch (otherModel.NAME) {
		case 'USER':

			break;
		default:
			return Boom.badImplementation("No inner join defined for table [" + NAME + "] for name [" + otherModel.NAME + "]");
			break;
	}
};