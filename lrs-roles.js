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
                        '/games/:id',
                        '/games/:gameId/versions',
                        '/games/:gameId/versions/:id',
                        '/sessions/:gameId/:versionId',
                        '/sessions/:gameId/:versionId/:event',
                        '/sessions/:id',
                        '/sessions/:id/remove',
                        '/sessions/:id/results',
                        '/sessions/:id/results/:resultId'
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