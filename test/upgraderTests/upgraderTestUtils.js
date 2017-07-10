'use strict';

module.exports = {
    compareDocuments: function compare(doc1, doc2){
        var equal = true;
        if(doc1 === undefined && doc2 === undefined || doc1 === null &&  doc2 === null){
            return true;
        }
        if(!doc1 || !doc2){
            console.log("ERROR COMPARING VALUES (SOME VALUE IS NOT VALID): ", doc1, " AND ", doc2);
            return false;
        }

        if(Array.isArray(doc1) && Array.isArray(doc2)) {
            if (doc1.length === doc2.length) {
                doc1.every(function (subObj) {
                    //check array elements
                    var founded = false;
                    doc2.some(function (subObj2) {
                        if (compare(subObj, subObj2)) {
                            founded = true;
                            return founded;
                        }
                    });
                    equal = founded;
                    return founded;
                })
            } else {
                equal = false;
            }
        } else {
            Object.keys(doc1).forEach(function (key) {
                if (equal === false) {
                    return;
                }
                var val = doc1[key];
                if (typeof(val) !== typeof({}) && typeof(val) !== typeof([])) {
                    if (typeof(val) === typeof('string')) {
                        if (val === doc2[key]) {
                            equal = true;
                            return;
                        }

                        try {
                            equal = compare(JSON.parse(val), JSON.parse(doc2[key]));
                            return;
                        } catch (exception) {
                            equal = false;
                            return;
                        }
                    } 

                    if (val !== doc2[key]) {
                        console.log("ERROR COMPARING VALUES: ", val, " (", typeof(val), ") AND ", doc2[key], " (", typeof(val), ")");
                        equal = false;
                    }

                    if (typeof(val) !== typeof(doc2[key])) {
                        console.log("ERROR COMPARING TYPES: ", val, " AND ", doc2[key]);
                        equal = false;
                    }

                } else {
                    equal = compare(val, doc2[key]);
                }
                return equal;
            });
        }
        return equal;
    }
};
