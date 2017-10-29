'use strict';

var express = require('express'),
    router = express.Router();

/**
 * @api {get} /env Return environment config.
 * @apiName getEnv
 * @apiGroup Env
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *    [
 *      {
 *          "useLrs": true
 *      }
 *    ]
 */
router.get('/', function (req, res) {
    res.json({
        useLrs: req.app.config.lrs.useLrs
    });
});

module.exports = router;
