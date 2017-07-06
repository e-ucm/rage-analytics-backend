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
        Object.keys(doc1).forEach(function(key) {
            var val = doc1[key];
            if(typeof(val) !== typeof({})){
                if(val !== doc2[key]){
                    console.log("ERROR COMPARING VALUES: ", val, " (",typeof(val),") AND ", doc2[key]," (",typeof(val),")");
                    equal = false;
                }
                if(typeof(val) !== typeof(doc2[key])){
                    console.log("ERROR COMPARING TYPES: ", val, " AND ", doc2[key])
                    equal = false;
                }
            } else {
                equal = compare(val, doc2[key]);
            }
        });
        return equal;
    }
};
