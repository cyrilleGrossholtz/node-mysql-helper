var _ = require("underscore");
var assert = require("assert");
var DbObject = require("../DbObject");
var List = require("./List");
var User = require("./User");
var Avatar = require("./Avatar");

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
    describe('#simple from', function() {
        it('@should resolve on to where when no join is defined', function() {
            assert.equal(
                DbObject.find(User).on('OTHERFIELD', " = ?", 1).toString(),
                "SELECT * FROM USER USER0 WHERE USER0.OTHERFIELD = ?"
            );
        });
    });
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
    describe('#join from Avatar', function() {
        it('@should throw when inner join does not exists', function() {
            var req;
            assert.throws(function() {
                req = DbObject.find(Avatar).innerJoin(User).toString();
            });
        });
        it('@should throw when left join does not exists', function() {
            var req;
            assert.throws(function() {
                req = DbObject.find(Avatar).leftJoin(User).toString();
            });
        });
        it('@should throw when inner join is an empty array', function() {
            var OtherUser = _.clone(User);
            OtherUser.join = {
                'AVATAR': []
            };
            assert.throws(function() {
                DbObject.find(OtherUser).leftJoin(Avatar).toString()
            });
        });
        it('@should throw when left join is an empty array', function() {
            var OtherUser = _.clone(User);
            OtherUser.join = {
                'AVATAR': []
            };
            assert.throws(function() {
                DbObject.find(OtherUser).leftJoin(Avatar).toString()
            });
        });
        it('@should work with single join too and where clause on last element', function() {
            assert.equal(
                DbObject.find(User).leftJoin(Avatar).where('OTHERFIELD', " = ?", 1).toString(),
                "SELECT * FROM USER USER0 LEFT JOIN AVATAR AVATAR1 ON AVATAR1.ID = USER0.AVATAR_ID WHERE AVATAR1.OTHERFIELD = ?"
            );
        });
        it('@should throw when you play with impossible inner values (nasty boy !)', function() {
            var req;
            req = DbObject.find(Avatar);
            req._from.push({
                type: "FAKE"
            });
            assert.throws(function() {
                req.toString();
            });
        });
    });
});

describe('Digest', function() {
    describe('#digestNested', function() {
        it('@should throw if argument is not array', function() {
            assert.throws(function() {
                DbObject.find(List).digestNested("not an array");
            });
        });
        it('@should should throw when digested object name does not match on first model', function() {
            assert.throws(function() {
                var res = DbObject.find(List).digestNested(
                    [{
                        SOMETHING_BAD: {
                            ID: 20,
                            NAME: "test",
                            DT_CRE: new Date(2015, 3, 5)
                        }
                    }]
                );
            });
        });
        it('@should should throw when digested object name does not match on second model', function() {
            assert.throws(function() {
                var res = DbObject.find(User).innerJoin(Avatar).digestNested(
                    [{
                        USER0: {
                            ID: 20,
                            NAME: "test",
                            DT_CRE: new Date(2015, 3, 5)
                        },
                        SOMETHING_BAD: {
                            ID: 20,
                            NAME: "test",
                            DT_CRE: new Date(2015, 3, 5)
                        }
                    }]
                );
            });
        });
        it('@should create required object when right single table, single line', function() {
            var res = DbObject.find(List).digestNested(
                [{
                    LIST0: {
                        ID: 20,
                        NAME: "test",
                        DT_CRE: new Date(2015, 3, 5)
                    }
                }]
            );
            assert.deepEqual(res, [{
                id: 20,
                nameOfTheList: "test",
                dtCre: new Date(2015, 3, 5)
            }]);
        });
        it('@should create required object when right single table, multiple line', function() {
            var res = DbObject.find(List).digestNested(
                [{
                    LIST0: {
                        ID: 20,
                        NAME: "test",
                        DT_CRE: new Date(2015, 3, 5)
                    }
                }, {
                    LIST0: {
                        ID: 21,
                        NAME: "other test",
                        DT_CRE: new Date(2015, 4, 6)
                    }
                }]
            );
            assert.deepEqual(res, [{
                id: 20,
                nameOfTheList: "test",
                dtCre: new Date(2015, 3, 5)
            }, {
                id: 21,
                nameOfTheList: "other test",
                dtCre: new Date(2015, 4, 6)
            }]);
        });
        it('@should create required object when right multiple table, single line', function() {
            var res = DbObject.find(User).innerJoin(Avatar).digestNested(
                [{
                    USER0: {
                        ID: 20,
                        USERNAME: "test",
                        PASSWORD: "secret",
                        DT_CRE: new Date(2015, 3, 5)
                    },
                    AVATAR1: {
                        ID: 100,
                        NAME: "other test",
                        DT_CRE: new Date(2015, 4, 6)
                    }
                }]
            );
            assert.deepEqual(res, [{
                id: 20,
                nameOfTheUser: "test",
                dtCre: new Date(2015, 3, 5),
                listOfAvatar: [{
                    id: 100,
                    nameOfTheAvatar: "other test",
                    dtCre: new Date(2015, 4, 6)
                }]
            }]);
        });
        it('@should create required object when right multiple table, multiple totally different lines', function() {
            var res = DbObject.find(User).innerJoin(Avatar).digestNested(
                [{
                    USER0: {
                        ID: 20,
                        USERNAME: "test",
                        PASSWORD: "secret",
                        DT_CRE: new Date(2015, 3, 5)
                    },
                    AVATAR1: {
                        ID: 100,
                        NAME: "other test",
                        DT_CRE: new Date(2015, 4, 6)
                    }
                }, {
                    USER0: {
                        ID: 21,
                        USERNAME: "test 1",
                        PASSWORD: "secret",
                        DT_CRE: new Date(2015, 3, 5)
                    },
                    AVATAR1: {
                        ID: 101,
                        NAME: "other test 1",
                        DT_CRE: new Date(2015, 4, 6)
                    }
                }]
            );
            assert.deepEqual(res, [{
                id: 20,
                nameOfTheUser: "test",
                dtCre: new Date(2015, 3, 5),
                listOfAvatar: [{
                    id: 100,
                    nameOfTheAvatar: "other test",
                    dtCre: new Date(2015, 4, 6)
                }]
            }, {
                id: 21,
                nameOfTheUser: "test 1",
                dtCre: new Date(2015, 3, 5),
                listOfAvatar: [{
                    id: 101,
                    nameOfTheAvatar: "other test 1",
                    dtCre: new Date(2015, 4, 6)
                }]
            }]);
        });
        it('@should create required object when right multiple table, multiple different lines (1st element common)', function() {
            var res = DbObject.find(User).innerJoin(Avatar).digestNested(
                [{
                    USER0: {
                        ID: 20,
                        USERNAME: "other test",
                        PASSWORD: "secret",
                        DT_CRE: new Date(2015, 4, 6)
                    },
                    AVATAR1: {
                        ID: 100,
                        NAME: "test",
                        DT_CRE: new Date(2015, 3, 5)
                    }
                }, {
                    USER0: {
                        ID: 20,
                        USERNAME: "other test",
                        PASSWORD: "secret",
                        DT_CRE: new Date(2015, 4, 6)
                    },
                    AVATAR1: {
                        ID: 101,
                        NAME: "test 1",
                        DT_CRE: new Date(2015, 3, 5)
                    }
                }]
            );
            assert.deepEqual(res, [{
                id: 20,
                nameOfTheUser: "other test",
                dtCre: new Date(2015, 4, 6),
                listOfAvatar: [{
                    id: 100,
                    nameOfTheAvatar: "test",
                    dtCre: new Date(2015, 3, 5)
                }, {
                    id: 101,
                    nameOfTheAvatar: "test 1",
                    dtCre: new Date(2015, 3, 5)
                }]
            }]);
        });

        it('@should create required object when complicated case', function() {
            var res = DbObject.find(List).innerJoin(User).innerJoin(Avatar).digestNested(
                [{ // line 1
                    LIST0: {
                        ID: 1,
                        NAME: "list 1",
                        DT_CRE: new Date(2015, 1, 1)
                    },
                    USER_HAS_LIST1: {
                        ID: 1,
                        NAME: "user has list 1",
                        DT_CRE: new Date(2015, 2, 2)
                    },
                    USER2: {
                        ID: 1,
                        USERNAME: "user 1",
                        PASSWORD: "secret",
                        DT_CRE: new Date(2015, 3, 3)
                    },
                    AVATAR3: {
                        ID: 1,
                        NAME: "avatar 1",
                        DT_CRE: new Date(2015, 4, 4)
                    }
                }, { // line 2
                    LIST0: {
                        ID: 1,
                        NAME: "list 1",
                        DT_CRE: new Date(2015, 1, 1)
                    },
                    USER_HAS_LIST1: {
                        ID: 2,
                        NAME: "user has list 2",
                        DT_CRE: new Date(2015, 2, 2)
                    },
                    USER2: {
                        ID: 2,
                        USERNAME: "user 2",
                        PASSWORD: "secret",
                        DT_CRE: new Date(2015, 3, 3)
                    },
                    AVATAR3: {
                        ID: 1,
                        NAME: "avatar 1",
                        DT_CRE: new Date(2015, 4, 4)
                    }
                }, { // line 3
                    LIST0: {
                        ID: 1,
                        NAME: "list 1",
                        DT_CRE: new Date(2015, 1, 1)
                    },
                    USER_HAS_LIST1: {
                        ID: 3,
                        NAME: "user has list 3",
                        DT_CRE: new Date(2015, 2, 2)
                    },
                    USER2: {
                        ID: 3,
                        USERNAME: "user 3",
                        PASSWORD: "secret",
                        DT_CRE: new Date(2015, 3, 3)
                    },
                    AVATAR3: {
                        ID: 2,
                        NAME: "avatar1",
                        DT_CRE: new Date(2015, 4, 4)
                    }
                }, { // line 4
                    LIST0: {
                        ID: 1,
                        NAME: "list 1",
                        DT_CRE: new Date(2015, 1, 1)
                    },
                    USER_HAS_LIST1: {
                        ID: 3,
                        NAME: "user has list 3",
                        DT_CRE: new Date(2015, 2, 2)
                    },
                    USER2: {
                        ID: 4,
                        USERNAME: "user 4",
                        PASSWORD: "secret",
                        DT_CRE: new Date(2015, 3, 3)
                    },
                    AVATAR3: {
                        ID: 2,
                        NAME: "avatar 2",
                        DT_CRE: new Date(2015, 4, 4)
                    }
                }, { // line 5
                    LIST0: {
                        ID: 2,
                        NAME: "list 2",
                        DT_CRE: new Date(2015, 1, 1)
                    },
                    USER_HAS_LIST1: {
                        ID: 3,
                        NAME: "user has list 1",
                        DT_CRE: new Date(2015, 2, 2)
                    },
                    USER2: {
                        ID: 4,
                        USERNAME: "user 4",
                        PASSWORD: "secret",
                        DT_CRE: new Date(2015, 3, 3)
                    },
                    AVATAR3: {
                        ID: 3,
                        NAME: "avatar 3",
                        DT_CRE: new Date(2015, 4, 4)
                    }
                }, { // line 6
                    LIST0: {
                        ID: 1,
                        NAME: "list 1",
                        DT_CRE: new Date(2015, 1, 1)
                    },
                    USER_HAS_LIST1: {
                        ID: 1,
                        NAME: "user has list 1",
                        DT_CRE: new Date(2015, 2, 2)
                    },
                    USER2: {
                        ID: 1,
                        USERNAME: "user 1",
                        PASSWORD: "secret",
                        DT_CRE: new Date(2015, 3, 3)
                    },
                    AVATAR3: {
                        ID: 1,
                        NAME: "avatar 1",
                        DT_CRE: new Date(2015, 4, 4)
                    }
                }]
            );
            assert.deepEqual(res, [{
                "dtCre": new Date(2015, 1, 1),
                "id": 1,
                "nameOfTheList": "list 1",
                "listOfUserHasList": [{
                    "dtCre": new Date(2015, 2, 2),
                    "id": 1,
                    "listOfUser": [{
                        "dtCre": new Date(2015, 3, 3),
                        "identifier": 1,
                        "listOfAvatar": [{
                            "dtCre": new Date(2015, 4, 4),
                            "id": 1,
                            "nameOfTheAvatar": "avatar 1"
                        }],
                        "nameOfTheUser": "user 1"
                    }],
                    "name": "user has list 1"
                }, {
                    "dtCre": new Date(2015, 2, 2),
                    "id": 2,
                    "listOfUser": [{
                        "dtCre": new Date(2015, 3, 3),
                        "identifier": 2,
                        "listOfAvatar": [{
                            "dtCre": new Date(2015, 4, 4),
                            "id": 1,
                            "nameOfTheAvatar": "avatar 1"
                        }],
                        "nameOfTheUser": "user 2"
                    }],
                    "name": "user has list 2"
                }, {
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
                        "identifier": 4,
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
                        "identifier": 4,
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
            }, {
                "dtCre": new Date(2015, 1, 1),
                "id": 1,
                "listOfUserHasList": [{
                    "dtCre": new Date(2015, 2, 2),
                    "id": 1,
                    "listOfUser": [{
                        "dtCre": new Date(2015, 3, 3),
                        "identifier": 1,
                        "listOfAvatar": [{
                            "dtCre": new Date(2015, 4, 4),
                            "id": 1,
                            "nameOfTheAvatar": "avatar 1"
                        }],
                        "nameOfTheUser": "user 1"
                    }],
                    "name": "user has list 1"
                }],
                "nameOfTheList": "list 1"
            }]);
        });

    });
});


describe('transform', function() {
    describe('#toCamel', function() {
        it('@should work in simple cases', function() {
            var dash = "CECI_EST_UN-TEST";
            var camel = DbObject.stringUtils.toCamel(dash);
            assert.equal(camel, "ceciEstUnTest");
        });
    });
    describe('#startsWith', function() {
        it('@should work in simple cases', function() {
            var string = "string";
            assert.equal(DbObject.stringUtils.startsWith(string, ""), true);
            assert.equal(DbObject.stringUtils.startsWith(string, "str"), true);
            assert.equal(DbObject.stringUtils.startsWith(string, "stri"), true);
            assert.equal(DbObject.stringUtils.startsWith(string, "string"), true);
            assert.equal(DbObject.stringUtils.startsWith(string, "stringa"), false);
            assert.equal(DbObject.stringUtils.startsWith(string, "astr"), false);
        });
    });
    describe('#occurrences', function() {
        it('@should work in simple cases', function() {
            var regexp = /foo/gi;
            assert.equal(DbObject.stringUtils.occurrences("other", regexp), 0);
            assert.equal(DbObject.stringUtils.occurrences("foo", regexp), 1);
            assert.equal(DbObject.stringUtils.occurrences("foofoofoo", regexp), 3);
            assert.equal(DbObject.stringUtils.occurrences("fooFoofoo", regexp), 3);
            assert.equal(DbObject.stringUtils.occurrences("fooOfFoo", regexp), 2);
        });
    });
});