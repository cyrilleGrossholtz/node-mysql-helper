var Boom = require('boom');
var async = require('async');
var _ = require('underscore');

var List = require('./List');
var User = require('./User');

//dbObject.find(List).where('ID', '= 2').innerJoin(User).on('RIGHTS', '>= 0').where('ID', '= 1').toString();
// -> 
// SELECT * FROM 
//   LIST LIST1 
//   INNER JOIN USER_HAS_LIST USER_HAS_LIST2 ON USER_HAS_LIST2.LIST_ID = LIST1.ID 
//	   AND USER_HAS_LIST2.RIGHTS >= 0
//   INNER JOIN USER USER3 ON USER_HAS_LIST2.USER_ID = USER3.ID
//   WHERE LIST1.ID = 2 AND USER3.ID = 1

exports.find = function(Model) {
	var idx = 0;
	var obj = {};

	obj.currentModel = Model;

	obj.select = "SELECT *";
	obj.from = [{name:Model.NAME}]; // array of obj {name: String, key: String, keyf: String}
	obj.where = []; // array of obj {identifier:String, field:String, value:String}


	obj.innerJoin = function(otherModel) {
		obj.currentModel = otherModel;
		_.each(Model.innerJoin(otherModel), function(value) {
			idx++;
			obj.from.push(value);
		});
		return obj;
	};

	obj.on = function(field, value) {
		obj.
	}

	obj.where = function(field, value) {
		obj.
		return obj;
	};

	obj.toString = function() {
		var res = obj.select;
		res += " FROM";
		_.each(obj.from, function(value, index) {
			if (index >= 1)
				
			res += value;
		});
	};

	return obj;
}