'use strict';

var should = require('should');

var CompletionChecker = function (max, callback) {
    this.ncom = 0;
    this.tocom = max;
    this.Completed = function () {
        this.ncom++;
        if (this.ncom >= this.tocom) {
            callback();
        }
    };
};

var compareDocuments = function (doc1, doc2, ignoredFields) {
    if (ignoredFields === undefined || ignoredFields === null) {
        ignoredFields = [];
    }

    var equal = true;
    if (doc1 === undefined && doc2 === undefined || doc1 === null && doc2 === null) {
        return true;
    }
    if (!doc1 || !doc2) {
        console.log('ERROR COMPARING VALUES (SOME VALUE IS NOT VALID): ', doc1, ' AND ', doc2);
        return false;
    }

    if (Array.isArray(doc1) && Array.isArray(doc2)) {
        if (doc1.length === doc2.length) {
            doc1.every(function (subObj) {
                // Check array elements
                var founded = false;
                doc2.some(function (subObj2) {
                    if (compareDocuments(subObj, subObj2)) {
                        founded = true;
                        return founded;
                    }
                });
                equal = founded;
                return founded;
            });
        } else {
            equal = false;
        }
    } else {
        Object.keys(doc1).forEach(function (key) {
            if (equal === false) {
                return;
            }

            if (ignoredFields.indexOf(key) !== -1) {
                equal = true;
                return;
            }
            var val = doc1[key];

            if (val instanceof Date) {
                val = val.toISOString();
            }


            if (typeof (val) !== typeof ({}) && typeof (val) !== typeof ([])) {
                if (typeof (val) === typeof ('string')) {
                    var val2 = doc2[key];
                    if (val2 instanceof Date) {
                        val2 = val2.toISOString();
                    }

                    if (val === val2) {
                        equal = true;
                        return;
                    }

                    try {
                        equal = compareDocuments(JSON.parse(val), JSON.parse(val2));
                        return;
                    } catch (exception) {
                        console.log('ERROR COMPARING "' + key + '" VALUES: ', val, ' (', typeof (val), ') AND ', val2, ' (', typeof (val), ')');
                        equal = false;
                        return;
                    }
                }

                if (val !== doc2[key]) {
                    console.log('ERROR COMPARING "' + key + '" VALUES: ', val, ' (', typeof (val), ') AND ', doc2[key], ' (', typeof (val), ')');
                    equal = false;
                }

                if (typeof (val) !== typeof (doc2[key])) {
                    console.log('ERROR COMPARING "' + key + '" TYPES: ', val, ' AND ', doc2[key]);
                    equal = false;
                }

            } else {
                equal = compareDocuments(val, doc2[key], ignoredFields);
            }
            return equal;
        });
    }
    return equal;
};

module.exports = {
    compareDocuments: compareDocuments,
    CompletionChecker: CompletionChecker,
    collectionComparer: function (db, name, data, callback, ignoredFields) {
        db.collection(name).find({}, function (err, result) {
            result.count().then(function (size) {

                var checker = new CompletionChecker(size, callback);
                should(size).equal(data[name].length);

                if (size === 0) {
                    callback();
                    return;
                }

                result.forEach(function (o1) {
                    if (o1 === null) {
                        return;
                    }

                    var found = false;
                    data[name].forEach(function (o2) {
                        if (o1._id.toString() === o2._id.toString()) {
                            found = true;
                            should(compareDocuments(o1, o2, ignoredFields)).equal(true);
                        }
                    });
                    should(found).equal(true);
                    checker.Completed();
                });
            });
        });
    }
};
