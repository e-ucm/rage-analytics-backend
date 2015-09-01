'use strict';

/**
 * This file exports the main roles Gleaner uses which are:
 *      'developer', 'teacher' and 'student'.
 *
 * Also indicates the anonymous routes used by the gleaner-tracker module to
 * send data to the collector server.
 */

exports.app = {
    roles: [
        {
            roles: ['developer', 'teacher', 'student'],
            allows: [
                {
                    resources: [
                        '/games',
                        '/games/:gameId',
                        '/games/:gameId/versions',
                        '/games/:gameId/versions/:versionId',
                        '/games/:gameId/versions/:versionId/sessions',
                        '/sessions/:sessionId',
                        '/sessions/:sessionId/remove',
                        '/sessions/:sessionId/results',
                        '/sessions/:sessionId/:event',
                        '/sessions/:sessionId/results/:resultId'
                    ],
                    permissions: '*'
                }
            ]
        }
    ],
    anonymous: [
        '/collector/start/:trackingCode',
        '/collector/track'
    ]
};