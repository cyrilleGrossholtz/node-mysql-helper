var Boom = require('boom');
var async = require('async');

var List = require('./List');
var User = require('./User');

dbObject = new DbObject();

dbObject.find(List).innerJoin(User).where('ID', 1);


exports.find = function(Model) {
	obj = {};
	obj.select = "SELECT *";
	obj.from = [];
	obj.where = [];
	obj.innerJoin = function(otherModel) {
		otherModel.innerJoin(Model);
		return obj;
	}

	obj.where = function(field, value) {
		return obj;
	}

	return obj;
}