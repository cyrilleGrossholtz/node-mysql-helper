var assert = require("assert");
var DbObject = require("../DbObject");
var List = require("../List");
var User = require("../User");

var Dumb = {
    NAME: "DUMB",
    where: {
        'TEST': {
            decalage: -1
        }
    }
};

describe('List', function() {
    describe('find', function() {
        it('should create query for simple select', function() {
            assert.equal(
                "SELECT * FROM LIST LIST0",
                DbObject.find(List).toString()
            );
        });
    });
    describe('where', function() {
        it('should query for simple select with unique where clause', function() {
            var req = DbObject.find(List).where("ID", " = ?", 1);
            assert.equal(
                "SELECT * FROM LIST LIST0 WHERE LIST0.ID = ?",
                req.toString()
            );
            assert.equal(1, req.args().length);
            assert.deepEqual([1], req.args());
        });
        it('should query for simple select with multiple where clause', function() {
            assert.equal(
                "SELECT * FROM LIST LIST0 WHERE LIST0.ID = 1 AND LIST0.FIELD = \"VALEUR\"",
                DbObject.find(List).where("ID", " = 1").where("FIELD", " = \"VALEUR\"").toString()
            );
        });
        it('should query for simple select with multiple where clause', function() {
            var req = DbObject.find(List).where("ID", " = 1").where("FIELD", " = \"VALEUR\"").where("OTHERFIELD", " = ?", "somevalue");
            assert.equal(
                "SELECT * FROM LIST LIST0 WHERE LIST0.ID = 1 AND LIST0.FIELD = \"VALEUR\" AND LIST0.OTHERFIELD = ?",
                req.toString()
            );
            assert.equal(1, req.args().length);
            assert.deepEqual(["somevalue"], req.args());
        });
    });
    describe('inner join with User', function() {
        it('should create query for simple select with inner join', function() {
            assert.equal(
                "SELECT * FROM LIST LIST0 INNER JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.LIST_ID = LIST0.ID INNER JOIN USER USER2 ON USER2.ID = USER_HAS_LIST1.USER_ID",
                DbObject.find(List).innerJoin(User).toString()
            );
        });
        it('should create query for simple select with inner join and specific ON join query', function() {
            assert.equal(
                "SELECT * FROM LIST LIST0 INNER JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.LIST_ID = LIST0.ID AND USER_HAS_LIST1.RIGHTS > 1 INNER JOIN USER USER2 ON USER2.ID = USER_HAS_LIST1.USER_ID",
                DbObject.find(List).innerJoin(User).on('RIGHTS', " > 1").toString()
            );
        });
    });
    describe('left join with User', function() {
        it('should create query for simple select with left join', function() {
            assert.equal(
                "SELECT * FROM LIST LIST0 LEFT JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.LIST_ID = LIST0.ID LEFT JOIN USER USER2 ON USER2.ID = USER_HAS_LIST1.USER_ID",
                DbObject.find(List).leftJoin(User).toString()
            );
        });
        it('should create query for simple select with inner join and specific ON join query', function() {
            assert.equal(
                "SELECT * FROM LIST LIST0 LEFT JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.LIST_ID = LIST0.ID AND USER_HAS_LIST1.RIGHTS > 1 LEFT JOIN USER USER2 ON USER2.ID = USER_HAS_LIST1.USER_ID",
                DbObject.find(List).leftJoin(User).on('RIGHTS', " > 1").toString()
            );
        });
    });
    describe('join with Dumb', function() {
        it('should throw when join with User', function() {
            var req;
            assert.throws(function() {
                req = DbObject.find(Dumb).innerJoin(User).toString();
            });
        });
        it('should throw when you play with impossible inner values', function() {
            var req;
            req = DbObject.find(Dumb);
            req._from.push({
                type: "FAKE"
            });
            assert.throws(function() {
                req.toString();
            });
        });
    });
});

describe('User', function() {
    describe('left join with List', function() {
        it('should create query for simple select with left join', function() {
            assert.equal(
                "SELECT * FROM USER USER0 LEFT JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.USER_ID = USER0.ID LEFT JOIN LIST LIST2 ON LIST2.ID = USER_HAS_LIST1.LIST_ID",
                DbObject.find(User).leftJoin(List).toString()
            );
        });
        it('should create query for simple select with inner join and specific ON join query', function() {
            assert.equal(
                "SELECT * FROM USER USER0 LEFT JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.USER_ID = USER0.ID AND USER_HAS_LIST1.RIGHTS > 1 LEFT JOIN LIST LIST2 ON LIST2.ID = USER_HAS_LIST1.LIST_ID",
                DbObject.find(User).leftJoin(List).on('RIGHTS', " > 1").toString()
            );
        });
    });
});