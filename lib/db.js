'use strict';

module.exports = (function () {
    return {
        setDBProvider: function (dbProvider) {
            this.dbProvider = dbProvider;
        },
        collection: function (name) {
            if (!this.db) {
                this.db = this.dbProvider.db();
            }

            return this.db.collection(name);
        }
    };
})();