# node-mysql-helper
This is a WIP plugin that aims at creating SQL query in a javascript way :

## creating request

**DbObject.find(List).toString()**
```sql
SELECT * FROM LIST LIST0
```

**DbObject.find(List).where("ID", " = ?", 1).toString()**
```sql
SELECT * 
	FROM LIST LIST0 
	WHERE LIST0.ID = ?
```
```javascript
args = [1]
```

**DbObject.find(List).innerJoin(User).toString()**
```sql
SELECT * 
	FROM LIST LIST0 
	INNER JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.LIST_ID = LIST0.ID 
	INNER JOIN USER USER2 ON USER2.ID = USER_HAS_LIST1.USER_ID
```
(works with any number of joining table)

**DbObject.find(List).innerJoin(User).on('RIGHTS', " > 1").toString()**
```sql
SELECT * 
	FROM LIST LIST0 
	INNER JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.LIST_ID = LIST0.ID 
		AND USER_HAS_LIST1.RIGHTS > 1 
	INNER JOIN USER USER2 ON USER2.ID = USER_HAS_LIST1.USER_ID
```

nb: For conveignance ORDER BY clause is automatically set by ID (because they have to be grouped for translation into objects)
nb2 : In future release it, ORDER BY clause should be customizable

## Using results
Please note that this currently only works with :
[mysql npm plugin](https://www.npmjs.com/package/mysql "mysql npm plugin link")
with the option : nestTables: true

```javascript
var request = DbObject.find(List).innerJoin(User).on('RIGHTS', " > 1");
var sql = request.toString();
var options = {sql: sql, nestTables: true};
connection.query(options, function(err, results) {
	if(err) {
		//process error
	}
	var res = request.digestNested(result);

	// res might be something like :
	var resMightBe = [
	{
        "dtCre": new Date(2015, 1, 1),
        "id": 1,
        "nameOfTheList": "list 1",
        "listOfUserHasList": [{
            "dtCre": new Date(2015, 2, 2),
            "id": 3,
            "listOfUser": [{
                "dtCre": new Date(2015, 3, 3),
                "identifier": 3,
                "listOfAvatar": [{
                    "dtCre": new Date(2015, 4, 4),
                    "id": 2,
                    "nameOfTheAvatar": "avatar1"
                }],
                "nameOfTheUser": "user 3"
            }, {
                "dtCre": new Date(2015, 3, 3),
                "id": 4,
                "listOfAvatar": [{
                    "dtCre": new Date(2015, 4, 4),
                    "id": 2,
                    "nameOfTheAvatar": "avatar 2"
                }],
                "nameOfTheUser": "user 4"
            }],
            "name": "user has list 3"
        }]
    }, {
        "dtCre": new Date(2015, 1, 1),
        "id": 2,
        "listOfUserHasList": [{
            "dtCre": new Date(2015, 2, 2),
            "id": 3,
            "listOfUser": [{
                "dtCre": new Date(2015, 3, 3),
                "id": 4,
                "listOfAvatar": [{
                    "dtCre": new Date(2015, 4, 4),
                    "id": 3,
                    "nameOfTheAvatar": "avatar 3"
                }],
                "nameOfTheUser": "user 4"
            }],
            "name": "user has list 1"
        }],
        "nameOfTheList": "list 2"
    }
    ];
}
```

# Configuration files (model description)
This is an exemple of configuration model
## Exemple model
```sql
CREATE TABLE `USER` (
    `ID` INT(11) NOT NULL AUTO_INCREMENT,
    `NAME` VARCHAR(100) NOT NULL,
    `EMAIL` VARCHAR(100) NOT NULL,
    `PASSWORD` VARCHAR(100) NOT NULL
);
CREATE TABLE `USER_HAS_LIST` (
    `ID` INT(11) NOT NULL AUTO_INCREMENT,
    `USER_ID` INT(11) NULL DEFAULT NULL,
    `LIST_ID` INT(11) NULL DEFAULT NULL,
    `RIGHTS` INT(11) NOT NULL DEFAULT '0',
);
CREATE TABLE `LIST` (
    `ID` INT(11) NOT NULL AUTO_INCREMENT,
    `NAME` TEXT NOT NULL
);
CREATE TABLE `AVATAR` (
    `ID` INT(11) NOT NULL AUTO_INCREMENT,
    `NAME` TEXT NOT NULL,
    `URL` TEXT NOT NULL
);
```



## Configuration files

```javascript
module.exports = {
	NAME: "LIST",
	identifier : "ID", // will resolve to default if not defined
	select: {
		NAME: "nameOfTheList"
	},
	join: {
		// [{NAME: String, key: String, keyf: String}]
		USER: [{
			NAME: "USER_HAS_LIST",
			keyf: "ID",
			key: "LIST_ID",
			identifier : "ID",
		}, {
			NAME: "USER",
			keyf: "USER_ID",
			key: "ID"
		}]
	},
	where: {
		// {field: String, value: String, decalage: int};
		RIGHTS: {
			decalage: "parent"
		}
	}
};
```

```javascript
module.exports = {
	NAME: "USER",
	identifier : "ID",
	select: {
		USERNAME: "nameOfTheUser",
		PASSWORD: false
	},
	join: {
		// [{NAME: String, key: String, keyf: String}]
		LIST: [{
			NAME: "USER_HAS_LIST",
			keyf: "ID",
			key: "USER_ID",
			identifier : "ID",
			select: {
				RIGHTS: "level"
			}
		}, {
			NAME: "LIST",
			keyf: "LIST_ID",
			key: "ID"
		}],
		AVATAR: [{
			NAME: "AVATAR",
			keyf: "AVATAR_ID",
			key: "ID"
		}]
	},
	where: {
		// {field: String, value: String, decalage: int};
		RIGHTS: {
			decalage: "parent"
		}
	}
};
```

```javascript
module.exports = {
	NAME: "AVATAR",
	select: {
		NAME: "nameOfTheAvatar"
	}
};
```

### Explanation

```javascript
module.exports = {
    NAME: "NAME_OF_THE_TABLE", // MANDATORY [IDF:STRING] : the name of the table in the model
    identifier : "IDENTIFIER", // MANDATORY [IDF:STRING] : the name of the ID column (must be unique)
    select: {
        SOME_COLUMN: "theNewNameItWillHave", // [IDF:STRING] : rename an identifier in the final object 
        SOME_OTHER_COLUMN: false // [IDF:BOOLEAN] : removes (or not if true) the column from the result (e.g. : password)
    },
    join: {
        // [{NAME: String, key: String, keyf: String, identifier}]
        USER: [ // defines an join to a table, here : NAME_OF_THE_OTHER_TABLE
        { // Definition of a join (there can be any number of join)
            NAME: "NAME_OF_THE_JOIN_TABLE", // the name of the join table
            keyf: "FOREIGN_IDENTIFIER", // the identifier to join on in the join table
            key: "CURRENT_TABLE_IDENTIFIER", // the identifier to join on in the current table
            identifier : "IDENTIFIER ", // the identifier of the join table
        }, { // the last join should represents an other model to join on with 
            // DbObject.find(MyFirstModelObject).innerJoin(MyNextModelObject)
            NAME: "NAME_OF_THE_OTHER_TABLE", // the name of the join table
            keyf: "FOREIGN_IDENTIFIER_ON_NEXT_TABLE", // the identifier to join on in the last table
            key: "JOIN_TABLE_IDENTIFIER" // the identifier to join on in the join table
            // No identifier ? Of course, the configuration will be loaded from the model
        }]
    },
    where: {
        // {field: String, value: String, decalage: String};
        SOME_FIELD_ON_JOIN_TABLE: { 
            decalage: "parent" // if you need to have a where clause on an JOIN attribute, you can but you have to describe this attribute here and say "look in the parent" or "look in the parent of my parent" so that we know in which table has the SOME_FIELD_ON_JOIN_TABLE field.
            //nb : only the number of "parent" string occurence counts
        }
    }
};
```

# Next steps
* Ease the rest of the CRUD style DB manipulations

# About this project
100% test coverage !