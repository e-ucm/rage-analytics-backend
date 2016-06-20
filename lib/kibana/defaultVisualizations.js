'use strict';

var defaultVisualizations = [
    {
        title: 'TotalAlternativesPreferred',
        visState: '{"title":"Total Alternatives Preferred","type":"metric","params":' +
        '{"handleNoResults":true,"fontSize":60},"aggs":[{"id":"1","type":"count","schema":"metric",' +
        '"params":{"customLabel":"Total alternatives preferred"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"test-57604f53f552624300d9caa6","query":' +
            '{"query_string":{"query":"event:preferred","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'TotalSessionPlayers',
        visState: '{"title":"Total Session Players","type":"metric","params":' +
        '{"handleNoResults":true,"fontSize":60},"aggs":[{"id":"1","type":"cardinality",' +
        '"schema":"metric","params":{"field":"gameplayId.keyword","customLabel":"Session Players"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"test-57604f53f552624300d9caa6","query":{"query_string":' +
            '{"query":"*","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'TotalSessionTracesCount',
        visState: '{"title":"Total Session Traces Count","type":"metric","params":' +
        '{"handleNoResults":true,"fontSize":60},"aggs":[{"id":"1","type":"count","schema":"metric","params":' +
        '{"customLabel":"Total Session Traces Count"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"test-57604f53f552624300d9caa6","query":{"query_string":' +
            '{"query":"*","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'SessionActivityOverTime',
        visState: '{"title":"Session Activity Over Time","type":"line","params":{"shareYAxis":' +
        'true,"addTooltip":true,"addLegend":true,"showCircles":true,"smoothLines":false,"interpolate":' +
        '"linear","scale":"linear","drawLinesBetweenPoints":true,"radiusRatio":9,"times":[],' +
        '"addTimeMarker":false,"defaultYExtents":false,"setYExtents":false,"yAxis":{}},"aggs":[' +
        '{"id":"1","type":"count","schema":"metric","params":{"customLabel":"Session Activity"}},' +
        '{"id":"2","type":"date_histogram","schema":"segment","params":{"field":"timestamp","interval":"auto",' +
        '"customInterval":"2h","min_doc_count":1,"extended_bounds":{},"customLabel":"Time"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"test-57604f53f552624300d9caa6","query":{"query_string":{"query":"*",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'DifferentAlternativesPreferred',
        visState: '{"title":"Different Alternatives Preferred","type":"metric","params":{"handleNoResults":true,' +
        '"fontSize":60},"aggs":[{"id":"1","type":"cardinality","schema":"metric","params":{"field":"target.keyword",' +
        '"customLabel":"Different alternatives preferred"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"test-57604f53f552624300d9caa6","query":{"query_string":{"analyze_wildcard":' +
            'true,"query":"event:preferred"}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'ActivityCountPerPlayer',
        visState: '{"title":"Activity Count Per Player","type":"histogram","params":{"shareYAxis":true,"addTooltip":' +
        'true,"addLegend":true,"scale":"linear","mode":"stacked","times":[],"addTimeMarker":false,"defaultYExtents":' +
        'false,"setYExtents":false,"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{"customLabel":' +
        '"Activity Count"}},{"id":"2","type":"terms","schema":"segment","params":{"field":"gameplayId.keyword","size":90,' +
        '"order":"desc","orderBy":"_term","customLabel":"Player"}},{"id":"3","type":"terms","schema":"group","params":' +
        '{"field":"event.keyword","size":15,"order":"desc","orderBy":"_term","customLabel":"xAPI Verb"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"test-57604f53f552624300d9caa6","query":{"query_string":{"query":"*",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'AlternativesCountPerPlayer',
        visState: '{"title":"Alternatives Count Per Player","type":"histogram","params":{"shareYAxis":true,"addTooltip"' +
        ':true,"addLegend":true,"scale":"linear","mode":"stacked","times":[],"addTimeMarker":false,"defaultYExtents":' +
        'false,"setYExtents":false,"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{"customLabel"' +
        ':"Alternatives Count"}},{"id":"2","type":"terms","schema":"segment","params":{"field":"gameplayId.keyword",' +
        '"size":90,"order":"desc","orderBy":"_term","customLabel":"Player"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"test-57604f53f552624300d9caa6","query":{"query_string":{"query":"event:preferred",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'AlternativesResponsesCount',
        visState: '{"title":"Alternatives Responses Count","type":"histogram","params":{"shareYAxis":true,"addTooltip":' +
        'true,"addLegend":true,"scale":"linear","mode":"stacked","times":[],"addTimeMarker":false,"defaultYExtents":false,' +
        '"setYExtents":false,"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{"customLabel":' +
        '"Alternatives Count"}},{"id":"2","type":"terms","schema":"segment","params":{"field":"target.keyword","size":50,' +
        '"order":"desc","orderBy":"_term","customLabel":"Alternative Target"}},{"id":"3","type":"terms","schema":"group",' +
        '"params":{"field":"response.keyword","size":5,"order":"desc","orderBy":"_term","customLabel":"Alternative Response"}}]' +
        ',"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"test-57604f53f552624300d9caa6","query":{"query_string":{"query":"event:preferred",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'PlayersActivity',
        visState: '{"title":"Players Activity","type":"histogram","params":{"shareYAxis":true,"addTooltip":true,"addLegend":' +
        'true,"scale":"linear","mode":"stacked","times":[],"addTimeMarker":false,"defaultYExtents":false,"setYExtents":false,' +
        '"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{"customLabel":"Activity Count"}},{"id":"2",' +
        '"type":"terms","schema":"segment","params":{"field":"gameplayId.keyword","size":15,"order":"desc","orderBy":"1",' +
        '"customLabel":"Player"}},{"id":"3","type":"terms","schema":"group","params":{"field":"event.keyword","size":10,' +
        '"order":"desc","orderBy":"1","customLabel":"xAPI Verb"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"test-57604f53f552624300d9caa6","query":{"query_string":{"query":"*","analyze_wildcard":' +
            'true}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'PlayersActivityOverTime',
        visState: '{"title":"Players Activity Over Time","type":"line","params":{"shareYAxis":true,"addTooltip":true,"addLegend"' +
        ':true,"showCircles":true,"smoothLines":false,"interpolate":"linear","scale":"linear","drawLinesBetweenPoints":true,' +
        '"radiusRatio":9,"times":[],"addTimeMarker":false,"defaultYExtents":false,"setYExtents":false,"yAxis":{}},"aggs":[' +
        '{"id":"1","type":"count","schema":"metric","params":{"customLabel":"Activity Count"}},{"id":"2","type":"date_histogram",' +
        '"schema":"segment","params":{"field":"timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,' +
        '"extended_bounds":{},"customLabel":"Time"}},{"id":"3","type":"terms","schema":"group","params":' +
        '{"field":"gameplayId.keyword","size":10,"order":"desc","orderBy":"1","customLabel":"Players"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"test-57604f53f552624300d9caa6","query":{"query_string":{"query":"*","analyze_wildcard":' +
            'true}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'xAPIVerbsActivity',
        visState: '{"title":"xAPI Verbs Activity","type":"histogram","params":{"shareYAxis":true,"addTooltip":true,"addLegend":' +
        'true,"scale":"linear","mode":"stacked","times":[],"addTimeMarker":false,"defaultYExtents":false,"setYExtents":false,"' +
        'yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{"customLabel":"Activity Count"}},{"id":"2","type":' +
        '"terms","schema":"segment","params":{"field":"event.keyword","size":15,"order":"desc","orderBy":"1","customLabel":' +
        '"xAPI Verb"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"test-57604f53f552624300d9caa6","query":{"query_string":{"query":"*",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'xAPIVerbsOverTime',
        visState: '{"title":"xAPI Verbs Over Time","type":"line","params":{"shareYAxis":true,"addTooltip":true,"addLegend":true,' +
        '"showCircles":true,"smoothLines":false,"interpolate":"linear","scale":"linear","drawLinesBetweenPoints":true,"radiusRatio"' +
        ':9,"times":[],"addTimeMarker":false,"defaultYExtents":false,"setYExtents":false,"yAxis":{}},"aggs":[{"id":"1",' +
        '"type":"count","schema":"metric","params":{"customLabel":"Activity Count"}},{"id":"2","type":"date_histogram",' +
        '"schema":"segment","params":{"field":"timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,' +
        '"extended_bounds":{},"customLabel":"Time"}},{"id":"3","type":"terms","schema":"group","params":{"field":"event.keyword",' +
        '"size":5,"order":"desc","orderBy":"1","customLabel":"xAPI Verb"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"test-57604f53f552624300d9caa6","query":{"query_string":{"query":"*","analyze_wildcard"' +
            ':true}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'AverageScorePerPlayer',
        visState: '{"title":"Average Score Per Player","type":"histogram","params":{"shareYAxis":true,"addTooltip":true,"addLegend"' +
        ':true,"scale":"linear","mode":"stacked","times":[],"addTimeMarker":false,"defaultYExtents":false,"setYExtents":false,' +
        '"yAxis":{}},"aggs":[{"id":"1","type":"avg","schema":"metric","params":{"field":"score_value","customLabel":' +
        '"Average Score"}},{"id":"2","type":"terms","schema":"segment","params":{"field":"gameplayId.keyword","size":70,' +
        '"order":"desc","orderBy":"1","customLabel":"Player"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"test-57604f53f552624300d9caa6","query":{"query_string":{"query":"event:set",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_'
    }
];

module.exports = defaultVisualizations;