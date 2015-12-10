var _ = require('underscore');

var INNER_JOIN = "INNER JOIN";
var LEFT_JOIN = "LEFT JOIN";
var PARENT = /parent/gi;

var listOf = "LIST_OF";
var defaultIdentifier = "ID";

//dbObject.find(List).where('ID', '= 2').innerJoin(User).on('RIGHTS', '>= 0').where('ID', '= 1').toString();
// -> 
// SELECT * FROM 
//   LIST LIST1 
//   INNER JOIN USER_HAS_LIST USER_HAS_LIST2 ON USER_HAS_LIST2.LIST_ID = LIST1.ID 
//	   AND USER_HAS_LIST2.RIGHTS >= 0
//   INNER JOIN USER USER3 ON USER_HAS_LIST2.USER_ID = USER3.ID
//   WHERE LIST1.ID = 2 AND USER3.ID = 1


/**
 * find
 * First function to call to create query, it creates the context objects :
 * obj._select -> Contains the string with the SELECT query (currently "SELECT *", but this should be perfected in the future)
 * obj._from -> Contains the ordered array of the tables that should be returned by the query, each containing minimal informations for processing
 * obj._where -> Contains the ordered array of the where clauses
 * obj._argsOn -> First ordered array of arguments for on clauses to be escaped in the query
 * obj._args -> Second ordered array of arguments for where clauses to be escaped in the query
 */
exports.find = function(Model) {
	var idx = 0;
	var obj = {};
	var lastJoinLength = 1;

	obj.currentModel = Model;

	obj._select = "SELECT *"; // String
	obj._from = [{
		"type": undefined,
		"NAME": Model.NAME,
		"identifier": Model.identifier,
		"on": [],
		"select": Model.select
	}];
	/* _from : array of obj :
		{
			type: String,
			NAME: String,
			key: String,
			keyf: String,
			on:[_where],
			select: {field: objective}
		}
	*/
	obj._where = [];
	/* _where : array of obj :
		{
			key:String,
			field:String,
			value:String
		}
	*/
	obj._args = []; // array of anything
	obj._argsOn = []; // array of anything

	obj.innerJoin = function(otherModel) {
		return _join(otherModel, INNER_JOIN);
	};

	obj.leftJoin = function(otherModel) {
		return _join(otherModel, LEFT_JOIN);
	};

	var _join = function(otherModel, type) {
		// verify join is defined
		if (!obj.currentModel.hasOwnProperty("join") || !obj.currentModel.join.hasOwnProperty(otherModel.NAME) || !_.isArray(obj.currentModel.join[otherModel.NAME]) || obj.currentModel.join[otherModel.NAME].length == 0) {
			console.log("THROWING : [No join defined for [" + obj.currentModel.NAME + "] [" + type + "] [" + otherModel.NAME + "]]");
			throw "No join defined for [" + obj.currentModel.NAME + "] [" + type + "] [" + otherModel.NAME + "]";
		}
		var join = obj.currentModel.join[otherModel.NAME];
		lastJoinLength = join.length;
		// get inner join from current model for new model in parameter
		_.each(join, function(value) {
			var add = _.clone(value);
			add.type = type;
			add.on = [];
			if (!add.hasOwnProperty("identifier")) {
				if (otherModel.hasOwnProperty("identifier")) {
					add.identifier = otherModel.identifier;
				} else {
					add.identifier = defaultIdentifier;
				}
			}
			idx++;
			obj._from.push(add);
			// add the new model in the stack
		});
		if (!obj._from[obj._from.length - 1].hasOwnProperty("select")) {
			obj._from[obj._from.length - 1].select = {};
		}
		_.each(otherModel.select, function(value, index) {
			obj._from[obj._from.length - 1].select[index] = value;
		});

		obj.currentModel = otherModel;
		return obj;
	}


	obj.on = function(field, value, arg) {
		// if the stack is empty (only first model), then resolve on with where
		if (obj._from.length <= 1) {
			return obj.where(field, value, arg);
		}
		// resolve WHERE for currentModel
		var where;
		if (obj.currentModel.hasOwnProperty("where") && obj.currentModel.where.hasOwnProperty(field)) {
			where = {
				decalage: -(stringUtils.occurrences(obj.currentModel.where[field].decalage, PARENT))
			};
		} else {
			where = {
				decalage: 0
			};
		}
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
		var where;
		if (obj.currentModel.hasOwnProperty("where") && obj.currentModel.where.hasOwnProperty(field)) {
			where = {
				decalage: -(stringUtils.occurrences(obj.currentModel.where[field].decalage, PARENT))
			};
			console.log("where.decalage");
			console.log(where.decalage);
		} else {
			where = {
				decalage: 0
			};
		}
		if (lastJoinLength + where.decalage <= 0) {
			console.log("THROWING : [WHERE for " + obj.currentModel.NAME + " is only defined after join with " + obj._from[obj._from.length - 1].NAME + "]");
			throw "WHERE for " + obj.currentModel.NAME + " is only defined after join with " + obj._from[obj._from.length - 1].NAME;
		}
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
						res += i_where(value.on);
						break;
					case LEFT_JOIN:
						res += " " + LEFT_JOIN + " " + value.NAME + " " + i_key(value.NAME, index) + " ON " + i_key(value.NAME, index) + "." + value.key + " = " + i_key(previous.NAME, index - 1) + "." + value.keyf
						res += i_where(value.on);
						break;
					default:
						console.log("THROWING : [Type [" + value.type + "] not currently implemented in FROM clause]");
						throw "Type [" + value.type + "] not currently implemented in FROM clause";
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
	};

	obj.digestNested = function(dbResult) {
		/*
		dbResult format type
		dbResult = [{
			table1: {
				fieldA: '...',
				fieldB: '...',
			},
			table2: {
				fieldA: '...',
				fieldB: '...',
			}
		}, ...] */
		if (!_.isArray(dbResult)) {
			console.log("THROWING : [digestNested only accepts array as parameter]");
			throw "digestNested only accepts array as parameter";
		}
		var recursion = {
				lineIndex: 0,
				dbResult: dbResult
			}
			//console.log(obj._from);
		return digestRecursive(recursion, 0)[1];

	};

	/* *********************************************************************
	 * recursion is an object that is common to all recursive height, it contains :
	 *  { 
	 * 		lineIndex : the line number currently processed
	 * 		dbResult : the result from the DB in the nested format
	 *	}
	 * fromIndex is the current index in the _from array (which is in the JOIN order)
	 * parentResultName is the name of the parent object in a result line
	 * parentIndex is the common value of the parent object
	 */
	var digestRecursive = function(recursion, fromIndex) {
		var res = [];

		// the from object for the current object
		var from = obj._from[fromIndex];

		// resultName is the name of the object in a result line
		var resultName = i_key(from.NAME, fromIndex);
		//console.log("begining of recursion [line=" + recursion.lineIndex + "][fromIndex=" + fromIndex + "][resultName=" + resultName + "]");

		// robj is the value of the current object on the current row
		var cobj;

		// lobj is the value to be added in the result array

		while (true) {
			if (!recursion.dbResult[recursion.lineIndex].hasOwnProperty(resultName)) {
				console.log("THROWING : [Could not find object[" + resultName + "] in line[" + recursion.lineIndex + "] ]");
				throw "Could not find object[" + resultName + "] in line[" + recursion.lineIndex + "]"
			}
			cobj = recursion.dbResult[recursion.lineIndex][resultName];
			// do the work
			var robj;
			robj = {};
			_.each(cobj, function(value, index) {
				console.log("index: " + index);
				console.log(from.select);
				if (from.select && from.select.hasOwnProperty(index)) {
					if (from.select[index] != false) {
						console.log("[" + from.NAME + "] index[" + index + "] 1= " + from.select[index]);
						robj[from.select[index]] = value;
					} else {
						console.log("[" + from.NAME + "] index[" + index + "] 2= ø");
					}
				} else {
					console.log("[" + from.NAME + "] index[" + index + "] 3= " + i_internProperty(index));
					robj[i_internProperty(index)] = value;
				}
			});

			// if there is a next _from element, try to fetch it
			if (obj._from.length > fromIndex + 1) {
				var innerList = digestRecursive(recursion, fromIndex + 1, resultName, from.identifier, cobj[from.identifier]);
				robj[i_internObj(innerList[0])] = innerList[1];
			}

			res.push(robj);

			// put the cursor to the next line
			// Stop the loop if :
			//  OR there is no next line
			//  OR the next line has a different parent index
			//console.log("from : ");
			//console.log(from);
			if (
				recursion.lineIndex + 1 >= recursion.dbResult.length
			) {
				//break if this is the last line
				console.log("end recursion");
				break;
			} else {
				// else check if there is a parent changed
				var parentChanged = false;
				var parentFromIndex;
				for (parentFromIndex = 0; parentFromIndex < fromIndex; parentFromIndex++) {
					var parentFrom = obj._from[parentFromIndex];
					// resultName is the name of the object in a result line
					var parentResult = i_key(parentFrom.NAME, parentFromIndex);
					var parentIdentifier = parentFrom.identifier;
					var currentParentIndexValue = recursion.dbResult[recursion.lineIndex][parentResult][parentIdentifier];
					var nextParentIndexValue = recursion.dbResult[recursion.lineIndex + 1][parentResult][parentIdentifier];
					if (currentParentIndexValue != nextParentIndexValue) {
						//console.log("end recursion [index="+parentFromIndex+"][result="+parentResult+"][identifier="+parentIdentifier+"]parent current line [" + currentParentIndexValue + "] parent next line [" + nextParentIndexValue + "]")
						parentChanged = true;
						break;
					}
				}
				if (parentChanged) {
					break;
				}
			}

			// if this is not the end of the object, then continue on the next line
			recursion.lineIndex++;
		}
		//console.log(res);
		return [from.NAME, res];
	}

	/*
	 * Internal helper functions
	 */

	/**
	 * returns the name of the "AS" tablename from 
	 * the name of the table
	 * the index of the table
	 * ex : AVATAR1
	 */
	var i_key = function(NAME, idx) {
		return NAME + idx;
	};

	/**
	 * returns the String to be used in ON or WHERE clause
	 */
	var i_where = function(on) {
		var res = "";
		_.each(on, function(value) {
			res += " AND " + value.key + "." + value.field + value.value;
		});
		return res;
	};

	/**
	 * Returns the string to be used as JS object property for join (inner objects)
	 */
	var i_internObj = function(propName) {
		return stringUtils.toCamel(listOf + "_" + propName);
	};

	/**
	 * Returns the string to be used as internal property (current rule: toCamelCase)
	 */
	var i_internProperty = function(propName) {
		return stringUtils.toCamel(propName);
	}


	return obj;
};

var stringUtils = exports.stringUtils = {
	toCamel: function(str) {
		return str.toLowerCase().replace(/[\_\-](\w)/g, function(x, chr) {
			return chr.toUpperCase();
		})
	},
	startsWith: function(str, expr) {
		//return str.indexOf(expr) == 0;
		return str.substring(0, expr.length) === expr;
	},
	occurrences: function(string, substring) {
		return (string.match(substring) || []).length;
	}
};