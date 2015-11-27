# node-mysql-helper
This is a WIP plugin that aims at creating SQL query in a javascript way :

**DbObject.find(List).toString()**
SELECT * FROM **LIST** LIST0

**DbObject.find(List).where("ID", " = ?", 1).toString()**
SELECT * FROM **LIST** LIST0 WHERE LIST0.**ID = ?**
args = [1]

**DbObject.find(List).innerJoin(User).toString()**
SELECT * FROM **LIST** LIST0 INNER JOIN **USER_HAS_LIST** USER_HAS_LIST1 ON USER_HAS_LIST1.LIST_ID = LIST0.ID INNER JOIN **USER** USER2 ON USER2.ID = USER_HAS_LIST1.USER_ID
(works with any number of joining table)

# Configuration files (model description):
This is an exemple of configuration model
## Exemple model
```
CREATE TABLE `USER` (
    `ID` INT(11) NOT NULL AUTO_INCREMENT,
    `EMAIL` VARCHAR(100) NOT NULL
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
```

## Configuration files

```
module.exports = {
	NAME: "LIST",
	join: {
		'USER': [{
			NAME: "USER_HAS_LIST",
			key: "LIST_ID",
			keyf: "ID"
		}, {
			NAME: "USER",
			key: "ID",
			keyf: "USER_ID"
		}]
	},
	where: {
		'RIGHTS': {
			decalage: -1
		}
	}
};
```

```
module.exports = {
	NAME: "USER",
	join: {
		'LIST': [{
			NAME: "USER_HAS_LIST",
			key: "USER_ID",
			keyf: "ID"
		}, {
			NAME: "LIST",
			key: "ID",
			keyf: "LIST_ID"
		}]
	},
	where: {
		'RIGHTS': {
			decalage: -1
		}
	}
};
```

# Next steps
* Create a plugin for [mysql npm plugin](https://www.npmjs.com/package/mysql "mysql npm plugin link") to be able to create JS Objects directly from DBObject.
* Ease the rest of the CRUD style DB manipulations