/*
 * Copyright 2016 e-UCM (http://www.e-ucm.es/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * This project has received funding from the European Union’s Horizon
 * 2020 research and innovation programme under grant agreement No 644187.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0 (link is external)
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * This file exports the main roles AnalyticsBackend uses which are:
 *      'developer', 'teacher' and 'student'.
 *
 * Also indicates the anonymous routes used by the gleaner-tracker module to
 * send data to the collector server.
 */

exports.app = {
    roles: [
        {
            roles: 'student',
            allows: [
                {
                    resources: [
                        '/games/public',
                        '/games/:gameId',
                        '/games/:gameId/versions',
                        '/games/:gameId/versions/:versionId',
                        '/games/:gameId/versions/:versionId/activities/my',
                        '/classes/my',
                        '/classes/:classId/activities/my',
                        '/activities/my',
                        '/activities/:activityId/results',
                        '/lti/keyid/:gameId/:versionId/:classId'
                    ],
                    permissions: [
                        'get'
                    ]
                },
                {
                    resources: [
                        '/classes/:classId',
                        '/activities/:activityId'
                    ],
                    permissions: [
                        'put',
                        'get'
                    ]
                }
            ]
        },
        {
            roles: 'teacher',
            allows: [
                {
                    resources: [
                        '/activities/data/:activityId',
                        '/activities/data/:activityId/:user'
                    ],
                    permissions: [
                        'delete'
                    ]
                },
                {
                    resources: [
                        '/analysis/:id',
                        '/games/public',
                        '/games/:gameId',
                        '/games/:gameId/versions',
                        '/games/:gameId/versions/:versionId',
                        '/games/:gameId/versions/:versionId/activities/my',
                        '/classes/my',
                        '/classes/:classId/activities/my',
                        '/activities/my',
                        '/activities/:activityId/results',
                        '/lti/keyid/:classId'
                    ],
                    permissions: [
                        'get'
                    ]
                },
                {
                    resources: [
                        '/classes/:classId',
                        '/classes/:classId/remove',
                        '/activities/:activityId',
                        '/activities/:activityId/remove',
                        '/activities/:activityId/results/:resultsId',
                        '/kibana/*'
                    ],
                    permissions: [
                        '*'
                    ]
                },
                {
                    resources: [
                        '/classes',
                        '/activities',
                        '/activities/:activityId/event/:event',
                        '/activities/:activityId/results',
                        '/lti'
                    ],
                    permissions: [
                        'post'
                    ]
                }
            ]
        },
        {
            roles: 'teachingassistant',
            allows: [
                {
                    resources: [
                        '/activities',
                        '/activities/:activityId/event/:event',
                        '/activities/:activityId/results',
                        '/analysis/:id',
                        '/games/public',
                        '/games/:gameId',
                        '/games/:gameId/versions',
                        '/games/:gameId/versions/:versionId',
                        '/games/:gameId/versions/:versionId/activities/my',
                        '/classes',
                        '/classes/my',
                        '/classes/:classId',
                        '/classes/:classId/remove',
                        '/classes/:classId/activities/my',
                        '/activities/my',
                        '/activities/:activityId/results',
                        '/activities/:activityId',
                        '/activities/:activityId/remove',
                        '/activities/:activityId/results/:resultsId',
                        '/lti',
                        '/lti/keyid/:classId',
                        '/kibana/*'
                    ],
                    permissions: [
                        'get'
                    ]
                },
                {
                    resources: [
                        '/kibana/hulldata/:activityId'
                    ],
                    permissions: [
                        'post'
                    ]
                }
            ]
        },
        {
            roles: 'developer',
            allows: [
                {
                    resources: [
                        '/games/my',
                        '/games/:gameId',
                        '/games/:gameId/versions',
                        '/games/:gameId/versions/:versionId',
                        '/kibana/*'
                    ],
                    permissions: [
                        '*'
                    ]
                },
                {
                    resources: [
                        '/analysis/:id',
                        '/analysis/:versionId'
                    ],
                    permissions: [
                        '*'
                    ]
                },
                {
                    resources: [
                        '/games/:gameId/remove'
                    ],
                    permissions: [
                        'put'
                    ]
                },
                {
                    resources: [
                        '/classes',
                        '/classes/:classId',
                        '/activities',
                        '/sessions/:sessionId',
                        '/lti/keyid/:classId'
                    ],
                    permissions: [
                        'get'
                    ]
                },
                {
                    resources: [
                        '/sessions/test/:versionId',
                        '/games'
                    ],
                    permissions: [
                        'post'
                    ]
                }
            ]
        }
    ],
    anonymous: [
        '/games/:id/xapi/:versionId',
        '/collector/start/:trackingCode',
        '/collector/track',
        '/lti/key/:id',
        '/env'
    ],
    autoroles: [
        'student',
        'teacher',
        'teachingassistant',
        'developer'
    ]
};
