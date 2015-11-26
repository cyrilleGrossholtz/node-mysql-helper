var _ = require('underscore');

var INNER_JOIN = "INNER JOIN";

var LEFT_JOIN = "LEFT JOIN";

//dbObject.find(List).where('ID', '= 2').innerJoin(User).on('RIGHTS', '>= 0').where('ID', '= 1').toString();
// -> 
// SELECT * FROM 
//   LIST LIST1 
//   INNER JOIN USER_HAS_LIST USER_HAS_LIST2 ON USER_HAS_LIST2.LIST_ID = LIST1.ID 
//	   AND USER_HAS_LIST2.RIGHTS >= 0
//   INNER JOIN USER USER3 ON USER_HAS_LIST2.USER_ID = USER3.ID
//   WHERE LIST1.ID = 2 AND USER3.ID = 1

exports.find = function(Model) {
	console.log("FIND [" + Model.NAME + "]")
	var idx = 0;
	var obj = {};

	obj.currentModel = Model;

	obj._select = "SELECT *";
	obj._from = [{
		"type": undefined,
		"NAME": Model.NAME,
		"on": []
	}]; // array of obj {type: String, NAME: String, key: String, keyf: String, on:[_where]}
	obj._where = []; // array of obj {key:String, field:String, value:String}
	obj._args = [];
	obj._argsOn = [];

	obj.innerJoin = function(otherModel) {
		var innerJoin;
		if (obj.currentModel.hasOwnProperty("join"))
			innerJoin = obj.currentModel.join[otherModel.NAME];
		// [{_from}]
		if (innerJoin == undefined)
			throw "No Inner join defined for model [" + currentModel.NAME + "] INNER JOIN model [" + otherModel.NAME + "]";
		_.each(innerJoin, function(value) {
			var add = _.clone(value);
			add.type = INNER_JOIN;
			add.on = [];
			idx++;
			obj._from.push(add);
		});

		obj.currentModel = otherModel;
		return obj;
	};

	obj.leftJoin = function(otherModel) {
		var leftJoin;
		if (obj.currentModel.hasOwnProperty("join"))
			leftJoin = obj.currentModel.join[otherModel.NAME];
		// [{_from}]
		if (leftJoin == undefined)
			throw "No Inner join defined for model [" + currentModel.NAME + "] INNER JOIN model [" + otherModel.NAME + "]";
		_.each(leftJoin, function(value) {
			var add = _.clone(value);
			add.type = LEFT_JOIN;
			add.on = [];
			idx++;
			obj._from.push(add);
		});

		obj.currentModel = otherModel;
		return obj;
	};


	obj.on = function(field, value, arg) {
		var where = obj.currentModel.where[field];
		if (!where)
			where = {
				decalage: 0
			};
		console.log("PUSH ON");
		obj._from[obj._from.length - 1 + where.decalage].on.push({
			"key": i_key(obj._from[obj._from.length - 1 + where.decalage].NAME, (idx + where.decalage)),
			"field": field,
			"value": value
		});
		if (arg != undefined) {
			obj._argsOn.push(arg);
		}
		// returns {field: String, value: String, decalage: Integer};
		return obj;
	};

	obj.where = function(field, value, arg) {
		var where = obj.currentModel.where[field];
		if (!where)
			where = {
				decalage: 0
			};
		// returns {field: String, value: String, decalage: Integer};
		obj._where.push({
			"key": i_key(obj._from[obj._from.length - 1 + where.decalage].NAME, (idx + where.decalage)),
			"field": field,
			"value": value
		});
		if (arg != undefined) {
			obj._args.push(arg);
		}
		return obj;
	};

	obj.toString = function() {
		//console.log(JSON.stringify(obj));
		var res = obj._select;
		res += " FROM";
		var previous = null
		_.each(obj._from, function(value, index) {
			if (index == 0)
				res += " " + value.NAME + " " + i_key(value.NAME, index);
			else {
				switch (value.type) {
					case INNER_JOIN:
						res += " " + INNER_JOIN + " " + value.NAME + " " + i_key(value.NAME, index) + " ON " + i_key(value.NAME, index) + "." + value.key + " = " + i_key(previous.NAME, index - 1) + "." + value.keyf
						res += i_on(value.on);
						break;
					case LEFT_JOIN:
						res += " " + LEFT_JOIN + " " + value.NAME + " " + i_key(value.NAME, index) + " ON " + i_key(value.NAME, index) + "." + value.key + " = " + i_key(previous.NAME, index - 1) + "." + value.keyf
						res += i_on(value.on);
						break;
					default:
						throw "Type [" + value.type + "] not currently implemented in FROM clause ";
				}
			}
			previous = value;
		});
		if (obj._where.length > 0) {
			res += " WHERE";
			_.each(obj._where, function(value, index) {
				if (index != 0)
					res += " AND";
				res += " " + value.key + "." + value.field + value.value;
			});
		}
		//console.log(res);
		return res;
	};

	obj.args = function() {
		var res = [];
		_.each(obj._argsOn, function(value) {
			res.push(value)
		});
		_.each(obj._args, function(value) {
			res.push(value)
		});
		return res;
	}

	var i_key = function(NAME, idx) {
		return NAME + idx;
	};

	var i_on = function(on) {
		var res = "";
		_.each(on, function(value) {
			res += " AND " + value.key + "." + value.field + value.value;
		});
		return res;
	}

	return obj;
};