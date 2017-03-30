'use strict';

module.exports.processResponse = function (promise, res) {
    promise.then(function (result) {
        res.json(result);
    })
    .fail(function (err) {
        if (err.stack) {
            console.error(err.stack);
        }

        if (err.status) {
            res.status(err.status);
            if (err.message) {
                res.json({message: err.message});
            } else {
                res.end();
            }
        } else {
            res.status(500).end();
        }
    });
};

module.exports.find = function (collection, createQuery) {
    return function (req, res) {
        var process = function (query) {
            module.exports.processResponse(collection.find(query), res);
        };
        if (createQuery) {
            createQuery(req, process);
        } else {
            process({});
        }
    };
};

module.exports.findById = function (collection) {
    return function (req, res) {
        module.exports.processResponse(collection.findById(req.params.id), res);
    };
};

module.exports.insert = function (collection, pre) {
    return function (req, res) {
        if (pre) {
            pre(req, res);
        }

        var insert = collection.insert(req.body);
        module.exports.processResponse(insert, res);
    };
};

module.exports.deleteById = function (collection) {
    return function (req, res) {
        module.exports.processResponse(collection.removeById(req.params.id), res);
    };
};

module.exports.findAndModify = function (collection, pre) {
    return function (req, res) {
        if (req.body && req.body._id) {
            delete req.body._id;
        }

        if (pre) {
            pre(req, res);
        }

        module.exports.processResponse(collection.findAndModify(req.params.id, req.body), res);
    };
};