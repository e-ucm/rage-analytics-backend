'use strict';

var express = require('express'),
    router = express.Router(),
    restUtils = require('./rest-utils');

var collector = require('../lib/collector');

/**
 * @api {post} /collector/start/:trackingCode Start a tracking session for a client
 * @apiDescription This method expects either an 'Authorization' header, a body with anonymous player id, or both empty for
 *  creating a new anonymous player.
 *  1.- Anonymous users:
 *      1.1.- New anonymous user: empty authorization header and empty body.
 *      1.2.- Existing anonymous user: empty authorization header but body must be: { "anonymous" : "player_id" }.
 *            Remember to include <Content-Type, application/json> header.
 *  2.- Authenticated user: header must be: <Authorization, 'Bearer JWT'>,
 *  The 'JSON Web Token (JWT) is the 'token' received when logging in as an identified user in the Authorization & Authentication
 *  (A2) service: http://e-ucm.github.io/a2/#api-Login-LoginNote that if the value of the 'Authorization'
 *  header is the 'JSON Web Token' received when logging into the Authorization & Authentication system (A2) the
 *  'actor' field of the response will have the player name field value set to the authenticated user.
 *
 * @apiName postCollectorStart
 * @apiGroup Collector
 *
 * @apiHeader {String} [Authorization] Authorization value. Format: "Bearer JWT".
 *
 * @apiParam {String} trackingCode The tracking code assigned to a given game.
 * @apiParam {String} [anonymous] The PlayerId of the anonymous player.
 *
 * @apiParamExample {json} Request-Example:
 *               { "anonymous": "player_id" }
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *          authToken: <String>,             - Used as 'Authorization' header for '/api/collector/track' requests.
 *                                             [/api/login, more info. at: http://e-ucm.github.io/a2/#api-Login-Login]
 *          actor: Object,                   - For sending xAPI traces, see https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#actor
 *          playerAnimalName: <String>,      - Anonymous player name,
 *          playerId: <String>,              - Player identifier (useful for anonymous users),
 *          objectId: <String>,              - Links to the game url, required by xAPI statements,
 *          session: <Int>,                  - Counter of sessions playeds
 *          firstSessionStarted: <String>,   - First session date and time formated using ISO 8601
 *          currentSessionStarted: <String>  - Current session date and time formated using ISO 8601
 *      }
 *
 * @apiError InvalidTrackingCode The 'trackingCode' is not valid.
 * @apiError PlayerNotFound The player couldn't be created or couldn't be found.
 * @apiError message Bearer is non JWT compilant orthe anonymous playerid is not valid or not found.
 *
 */
router.post('/start/:trackingCode', function (req, res) {
    var username = req.headers['x-gleaner-user'];
    var body = req.body;
    restUtils.processResponse(collector.start(body, req.params.trackingCode, req.headers.authorization, username), res);
});

/**
 * @api {post} /collector/track Tracks data from the request body.
 * @apiDescription Note that this method expects an 'Authorization' header with the following format
 *  <Authorization, 'authToken'>.
 *  The 'authToken' can be obtained by issuing a request to '/api/collector/start/:trackingCode'.
 *
 * @apiName postCollectorTrack
 * @apiGroup Collector
 *
 * @apiHeader {String} Authorization Authorization token obtained on start. Format: "authToken".
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *         "message": "Success."
 *      }
 *
 * @apiError BadRequest The statement must be an array. Example: [{trace1},{trace2}].
 * @apiError NotValidSession No active session can fit this user.
 */
router.post('/track', function (req, res) {
    restUtils.processResponse(collector.track(req.headers.authorization, req.body), res);
});

/**
 * @api {post} /collector/end Ends the current authorization.
 * @apiDescription Note that this method expects an 'Authorization' header with the following format
 *  <Authorization, 'authToken'>.
 *  The 'authToken' can be obtained by issuing a request to '/api/collector/start/:trackingCode' or by
 *  re-using a previous active authToken obtained from attempt list.
 *
 * @apiName postCollectorTrack
 * @apiGroup Collector
 *
 * @apiHeader {String} Authorization Authorization token obtained on start. Format: "authToken".
 *
 * @apiSuccess(200) Success.
 *
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *         "message": "Success."
 *      }
 *
 * @apiError BadRequest The statement must be an array. Example: [{trace1},{trace2}].
 * @apiError NotValidSession No active session can fit this user.
 */
router.post('/track', function (req, res) {
    restUtils.processResponse(collector.track(req.headers.authorization, req.body), res);
});

module.exports = router;