'use strict';

var express = require('express'),
    router = express.Router();

/**
 * @api {post} /api/kibana/templates/:type/:id Adds a new template in .template index of ElasticSearch.
 * @apiDescription :type must be visualization or index
 * @apiName PostTemplate
 * @apiGroup Templates
 *
 * @apiParam {String} id The visualization id
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_index": ".template",
 *          "_type": "visualization",
 *         "_id": "template_visualization",
 *           "_version": 1,
 *          "_shards": {
 *              "total": 2,
 *              "successful": 1,
 *              "failed": 0
 *          },
 *          "created": true
 *      }
 */
router.post('/templates/:type/:id', function (req, res) {
    if(req.params.type!=='visualization' && req.params.type!=='index'){
        res.json('Invalid type parameter', 300);
    } else {
        req.app.esClient.index({
            index: '.template',
            type: req.params.type,
            id: req.params.id,
            body: req.body
        }, function (error, response) {
            if (!error) {
                res.json(response);
            } else {
                res.json(error);
            }
        });
    }
});

/**
 * @api {get} /api/kibana/templates/fields/:id Return the fields of visualization with the id.
 * @apiName GetVisualizationFields
 * @apiGroup Kibana
 *
 * @apiParam {String} id The visualization id
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      ['field1', 'field2', 'field3']
 */
router.get('/templates/fields/:id', function (req, res) {
    req.app.esClient.search({
        index: '.template',
        q: '_id:' + req.params.id
    }, function (error, response) {
        if (!error) {
            var re = /"field":"(\w+.?\w+)"/g;

            var sourceField = 'visState';
            if(response.hits.hits[0]._type==='index'){
                sourceField = 'fields';
                re = /"name":"(\w+.?\w+)"/g;
            }

            var result = [];
            var pos = 0;
            var m;
            while ((m = re.exec(response.hits.hits[0]._source[sourceField])) !== null) {
                if (! exist(result, m[1])) {
                    result[pos] = m[1];
                    pos++;
                }

                if (m.index === re.lastIndex) {
                    re.lastIndex++;

                }
            }

            res.json(result);
        } else {
            res.json(error);
        }
    });
});

function exist(result, element) {
    var exist = false;
    result.forEach(function (str) {
        if (str === element) {
            exist = true;
        }
    });
    return exist;
}

/**
 * @api {post} /api/kibana/visualization/game/:id Adds a new visualization in .kibana index of ElasticSearch.
 * @apiName PostVisualization
 * @apiGroup Kibana
 *
 * @apiParam {String} id The visualization id
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_index": ".games",
 *          "_type": "visualization",
 *          "_id": "testing",
 *          "_version": 1,
 *          "_shards": {
 *              "total": 2,
 *              "successful": 1,
 *              "failed": 0
 *          },
 *          "created": true
 *      }
 */
router.post('/visualization/game/:id', function (req, res) {
    req.app.esClient.search({
        index: '.template',
        q: '_id:'+req.params.id
    }, function (error, response) {
        if (!error) {
            // Replace template and save it
            var obj = response.hits.hits[0]._source;
            Object.keys(req.body).forEach(function (key) {
                obj.visState = obj.visState.replace(new RegExp(key, 'g'), req.body[key]);
            });

            req.app.esClient.index({
                index: '.games',
                type: 'visualization',
                id: req.params.id,
                body: obj
            }, function (error, response) {
                if (!error) {
                    res.json(response);
                } else {
                    res.json(error);
                }
            });
        } else {
            res.json(error);
        }
    });
});

/**
 * @api {post} /api/kibana/visualization/list/:id Adds a list of visualization names in a document with the id.
 * @apiName PostVisualization
 * @apiGroup Kibana
 *
 * @apiParam {String} id The list id
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_index": ".games",
 *          "_type": "list",
 *          "_id": "visualization_list",
 *          "_version": 1,
 *          "_shards": {
 *              "total": 2,
 *              "successful": 1,
 *              "failed": 0
 *          },
 *          "created": true
 *      }
 */
router.post('/visualization/list/:id', function (req, res) {
    req.app.esClient.index({
        index: '.games',
        type: 'list',
        id: req.params.id,
        body: req.body
    }, function (error, response) {
        if (!error) {
            res.json(response);
        } else {
            res.json(error);
        }
    });
});

/**
 * @api {get} /api/kibana/visualization/list/:id Return the list with the id.
 * @apiName GetVisualizationFields
 * @apiGroup Kibana
 *
 * @apiParam {String} id The visualization id
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "visualizations": [
 *              "UserScore_56962ebf5d817ba040bdca5f"
 *          ]
 *      }
 */
router.get('/visualization/list/:id', function (req, res) {
    req.app.esClient.search({
        index: '.games',
        q: '_id:' + req.params.id
    }, function (error, response) {
        if (!error) {
            res.json(response.hits.hits[0]._source);
        } else {
            res.json(error);
        }
    });
});

/**
 * @api {post} /api/kibana/index/:indexTemplate/:indexId Adds a new index in .kibana index of ElasticSearch.
 * @apiName PostIndex
 * @apiGroup Index
 *
 * @apiParam {String} id The visualization id
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_index": ".kibana",
 *          "_type": "index-pattern",
 *         "_id": "0535H53W34g",
 *           "_version": 1,
 *          "_shards": {
 *              "total": 2,
 *              "successful": 1,
 *              "failed": 0
 *          },
 *          "created": true
 *      }
 */
router.post('/index/:indexTemplate/:indexName', function (req, res) {
    req.body.title = req.params.indexName;
    req.app.esClient.search({
        index: '.template',
        q: '_id:' + req.params.indexTemplate
    }, function (error, response) {
        response.hits.hits[0]._source.title = req.params.indexName;
        req.app.esClient.index({
            index: '.kibana',
            type: 'index-pattern',
            id: req.params.indexName,
            body: response.hits.hits[0]._source
        }, function (error, response) {
            if (!error) {
                res.json(response);
            } else {
                res.json(error);
            }
        });
    });
});

/**
 * @api {post} /api/kibana/visualization/session/:gameId/:sessionId Adds a new visualization in .kibana index of ElasticSearch.
 * @apiName PostVisualization
 * @apiGroup Kibana
 *
 * @apiParam {String} id The visualization id
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          "_index": ".kibana",
 *          "_type": "visualization",
 *          "_id": "sessionId",
 *          "_version": 1,
 *          "_shards": {
 *              "total": 2,
 *              "successful": 1,
 *              "failed": 0
 *          },
 *          "created": true
 *      }
 */
router.post('/visualization/session/:visualizationId/:sessionId', function (req, res) {
    req.app.esClient.search({
        index: '.games',
        q: '_id:' + req.params.visualizationId
    }, function (error, response) {
        if (!error) {
            // Replace template and save it
            var obj = response.hits.hits[0]._source;
            obj.kibanaSavedObjectMeta.searchSourceJSON = obj.kibanaSavedObjectMeta.searchSourceJSON.replace(
                new RegExp('{\\"index\\":\\".+\\",', 'g'), '{\\"index\\":\\"' + req.params.sessionId + '\\",');


            req.app.esClient.index({
                index: '.kibana',
                type: 'visualization',
                id: response.hits.hits[0]._id+'_'+req.params.sessionId,
                body: obj
            }, function (error, response) {
                if (!error) {
                    res.json(response);
                } else {
                    res.json(error);
                }
            });
        } else {
            res.json(error);
        }
    });
});

module.exports = router;