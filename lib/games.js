'use strict';

module.exports = (function() {
    var Collection = require('easy-collections');
    var versions = require('./versions');
    var games = new Collection(require('./db'), 'games');

    games.sort = {
        _id: -1
    };

    games.preRemove(function(_id, next) {
        versions.remove({
            gameId: _id
        }).then(function() {
            next();
        }).fail(function() {
            next();
        });
    });

    return games;
})();