var _ = require("underscore");
var assert = require("assert");
var DbObject = require("../DbObject");
var List = require("./List");
var User = require("./User");

var Dumb = {
    NAME: "DUMB"
};

describe('List', function() {
    describe('#find', function() {
        it('@should create query for simple select', function() {
            assert.equal(
                DbObject.find(List).toString(),
                "SELECT * FROM LIST LIST0"
            );
        });
    });
    describe('#where', function() {
        it('@should query for simple select with unique where clause', function() {
            var req = DbObject.find(List).where("ID", " = ?", 1);
            assert.equal(
                req.toString(),
                "SELECT * FROM LIST LIST0 WHERE LIST0.ID = ?"
            );
            assert.equal(1, req.args().length);
            assert.deepEqual([1], req.args());
        });
        it('@should query for simple select with multiple where clause', function() {
            assert.equal(
                DbObject.find(List).where("ID", " = 1").where("FIELD", " = \"VALEUR\"").toString(),
                "SELECT * FROM LIST LIST0 WHERE LIST0.ID = 1 AND LIST0.FIELD = \"VALEUR\""
            );
        });
        it('@should query for simple select with multiple where clause some having query args', function() {
            var req = DbObject.find(List).where("ID", " = 1").where("FIELD", " = \"VALEUR\"").where("OTHERFIELD", " = ?", "somevalue");
            assert.equal(
                req.toString(),
                "SELECT * FROM LIST LIST0 WHERE LIST0.ID = 1 AND LIST0.FIELD = \"VALEUR\" AND LIST0.OTHERFIELD = ?"
            );
            assert.equal(1, req.args().length);
            assert.deepEqual(["somevalue"], req.args());
        });
        it('@should throw if where on field with decalage = -1 when there where no multiple inner join', function() {
            assert.throws(function() {
                var req = DbObject.find(List).where("RIGHTS", " = ?", 1);
            });
        });
    });
    describe('#inner join with User', function() {
        it('@should create query for simple select with inner join', function() {
            assert.equal(
                DbObject.find(List).innerJoin(User).toString(),
                "SELECT * FROM LIST LIST0 INNER JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.LIST_ID = LIST0.ID INNER JOIN USER USER2 ON USER2.ID = USER_HAS_LIST1.USER_ID"
            );
        });
        it('@should create query for simple select with inner join and specific ON join query', function() {
            assert.equal(
                DbObject.find(List).innerJoin(User).on('ID', " = 1").toString(),
                "SELECT * FROM LIST LIST0 INNER JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.LIST_ID = LIST0.ID INNER JOIN USER USER2 ON USER2.ID = USER_HAS_LIST1.USER_ID AND USER2.ID = 1"
            );
        });
        it('@should create query for simple select with inner join and specific ON for inner request', function() {
            assert.equal(
                DbObject.find(List).innerJoin(User).on('RIGHTS', " > 1").toString(),
                "SELECT * FROM LIST LIST0 INNER JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.LIST_ID = LIST0.ID AND USER_HAS_LIST1.RIGHTS > 1 INNER JOIN USER USER2 ON USER2.ID = USER_HAS_LIST1.USER_ID"
            );
        });
        it('@should create query for simple select with inner join and specific ON join query', function() {
            var req = DbObject.find(List).where('OTHERFIELD', " = ?", "somevalue").innerJoin(User).on('RIGHTS', " > ?", 1);
            assert.equal(
                req.toString(),
                "SELECT * FROM LIST LIST0 INNER JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.LIST_ID = LIST0.ID AND USER_HAS_LIST1.RIGHTS > ? INNER JOIN USER USER2 ON USER2.ID = USER_HAS_LIST1.USER_ID WHERE LIST0.OTHERFIELD = ?"
            );
            assert.equal(2, req.args().length);
            assert.deepEqual([1, "somevalue"], req.args());
        });
    });
    describe('#left join with User', function() {
        it('@should create query for simple select with left join', function() {
            assert.equal(
                DbObject.find(List).leftJoin(User).toString(),
                "SELECT * FROM LIST LIST0 LEFT JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.LIST_ID = LIST0.ID LEFT JOIN USER USER2 ON USER2.ID = USER_HAS_LIST1.USER_ID"
            );
        });
        it('@should create query for simple select with inner join and specific ON join query', function() {
            assert.equal(
                DbObject.find(List).leftJoin(User).on('RIGHTS', " > 1").toString(),
                "SELECT * FROM LIST LIST0 LEFT JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.LIST_ID = LIST0.ID AND USER_HAS_LIST1.RIGHTS > 1 LEFT JOIN USER USER2 ON USER2.ID = USER_HAS_LIST1.USER_ID"
            );
        });
    });
});

describe('User', function() {
    describe('#left join with List', function() {
        it('@should create query for simple select with left join', function() {
            assert.equal(
                DbObject.find(User).leftJoin(List).toString(),
                "SELECT * FROM USER USER0 LEFT JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.USER_ID = USER0.ID LEFT JOIN LIST LIST2 ON LIST2.ID = USER_HAS_LIST1.LIST_ID"
            );
        });
        it('@should create query for simple select with inner join and specific ON join query', function() {
            assert.equal(
                DbObject.find(User).leftJoin(List).on('RIGHTS', " > 1").toString(),
                "SELECT * FROM USER USER0 LEFT JOIN USER_HAS_LIST USER_HAS_LIST1 ON USER_HAS_LIST1.USER_ID = USER0.ID AND USER_HAS_LIST1.RIGHTS > 1 LEFT JOIN LIST LIST2 ON LIST2.ID = USER_HAS_LIST1.LIST_ID"
            );
        });
    });
    describe('#join with Dumb for unspecified cases', function() {
        it('@should throw when inner join with User', function() {
            var req;
            assert.throws(function() {
                req = DbObject.find(Dumb).innerJoin(User).toString();
            });
        });
        it('@should throw when left join with User', function() {
            var req;
            assert.throws(function() {
                req = DbObject.find(Dumb).leftJoin(User).toString();
            });
        });
        it('@should throw when inner join is an empty array', function() {
            var OtherUser = _.clone(User);
            OtherUser.join = {
                'DUMB': []
            };
            assert.throws(function() {
                DbObject.find(OtherUser).leftJoin(Dumb).toString()
            });
        });
        it('@should throw when left join is an empty array', function() {
            var OtherUser = _.clone(User);
            OtherUser.join = {
                'DUMB': []
            };
            assert.throws(function() {
                DbObject.find(OtherUser).leftJoin(Dumb).toString()
            });
        });
        it('@should resolve on to where when no join is defined', function() {

            assert.equal(
                DbObject.find(User).on('OTHERFIELD', " = ?", 1).toString(),
                "SELECT * FROM USER USER0 WHERE USER0.OTHERFIELD = ?"
            );
        });
        it('@should throw when join with User with where clause', function() {
            var OtherUser = _.clone(User);
            OtherUser.join = {
                'DUMB': [{
                    NAME: "DUMB",
                    key: "DUMB_ID",
                    keyf: "ID"
                }]
            };
            assert.equal(
                DbObject.find(OtherUser).leftJoin(Dumb).where('OTHERFIELD', " = ?", 1).toString(),
                "SELECT * FROM USER USER0 LEFT JOIN DUMB DUMB1 ON DUMB1.DUMB_ID = USER0.ID WHERE DUMB1.OTHERFIELD = ?"
            );
        });
        it('@should throw when you play with impossible inner values', function() {
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


describe('transform', function() {
    describe('#toCamel', function() {
        it('@should work in simple cases', function() {
            var dash = "CECI_EST_UN-TEST";
            var camel = DbObject.utils.toCamel(dash);
            assert.equal(camel, "ceciEstUnTest");
        });
    });
});