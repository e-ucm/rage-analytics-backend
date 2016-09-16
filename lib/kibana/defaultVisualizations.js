'use strict';

var defaultVisualizations = [
    {
        title: 'Alternative Selected Correct Incorrect Per QuestionId - Cmn',
        visState: '{"title":"Alternative Selected Correct Incorrect Per QuestionId","type":"histogram",' +
        '"params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,"defaultYExtents":false,"mode":"stacked",' +
        '"scale":"linear","setYExtents":false,"shareYAxis":true,"times":[],"yAxis":{}},"aggs":[{"id":"1","type":"count",' +
        '"schema":"metric","params":{}},{"id":"2","type":"terms","schema":"segment","params":{"field":"target.keyword",' +
        '"include":{"pattern":""},"size":100,"order":"asc","orderBy":"_term","customLabel":"Alternative"}},{"id":"4",' +
        '"type":"filters","schema":"group","params":{"filters":[{"input":{"query":{"query_string":{"query":"success:true"' +
        ',"analyze_wildcard":true}}},"label":""},{"input":{"query":{"query_string":{"query":"success:false",' +
        '"analyze_wildcard":true}}}}]}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"*Incorrect":"#BF1B00","response:Correct":"#3F6833","response:Incorrect":"#BF1B00",' +
        '"success:true":"#7EB26D","success:false":"#E24D42"},"legendOpen":true}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d6db099348f3006efbdb7a","query":{"query_string":{"query":"event:selected && !type:menu",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'Completabe Completed Times - Cmn',
        visState: '{"title":"Completabe Completed Times","type":"histogram","params":{"shareYAxis":true,"addTooltip":true,' +
        '"addLegend":true,"scale":"linear","mode":"grouped","times":[],"addTimeMarker":false,"defaultYExtents":false,' +
        '"setYExtents":false,"yAxis":{}},"aggs":[{"id":"2","type":"min","schema":"metric","params":{"field":"time",' +
        '"customLabel":"Min Time"}},{"id":"1","type":"avg","schema":"metric","params":{"field":"time"}},{"id":"3","type":"max",' +
        '"schema":"metric","params":{"field":"time","customLabel":"Max Time"}},{"id":"4","type":"terms","schema":"split",' +
        '"params":{"field":"target.keyword","size":15,"order":"desc","orderBy":"_term","customLabel":"Times","row":false}}],' +
        '"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d81e1785b094006eab04d7","query":{"query_string":{"analyze_wildcard":true,' +
            '"query":"event:completed"}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'Total Session Players - Cmn',
        visState: '{"title":"Total Session Players","type":"metric","params":{"handleNoResults":true,"fontSize":60},' +
        '"aggs":[{"id":"1","type":"cardinality","schema":"metric","params":{"field":"name.keyword","customLabel":"SessionPlayers"}}],' +
        '"listeners":{}}',
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
        title: 'Videos Seen Skipped - Cmn',
        visState: '{"title":"Videos Seen - Skipped","type":"histogram","params":{"addLegend":true,"addTimeMarker":false,' +
        '"addTooltip":true,"defaultYExtents":false,"mode":"stacked","scale":"linear","setYExtents":false,"shareYAxis":true,' +
        '"times":[],"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{}},{"id":"2","type":"filters",' +
        '"schema":"group","params":{"filters":[{"input":{"query":{"query_string":{"analyze_wildcard":true,' +
        '"query":"event:accessed"}}},"label":""},{"input":{"query":{"query_string":{"analyze_wildcard":true,' +
        '"query":"event:skipped"}}}}]}},{"id":"3","type":"significant_terms","schema":"segment",' +
        '"params":{"field":"target.keyword","size":78}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"event:skipped":"#E5AC0E","event:accessed":"#64B0C8"}}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d81e1785b094006eab04d7","query":{"query_string":{"analyze_wildcard":true,' +
            '"query":"type:cutscene"}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'Session Activity Over Time',
        visState: '{"title":"Session Activity Over Time","type":"line","params":{"shareYAxis":true,"addTooltip":true,' +
        '"addLegend":true,"showCircles":true,"smoothLines":false,"interpolate":"linear","scale":"linear",' +
        '"drawLinesBetweenPoints":true,"radiusRatio":9,"times":[],"addTimeMarker":false,"defaultYExtents":false,' +
        '"setYExtents":false,"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{}},' +
        '{"id":"2","type":"date_histogram","schema":"segment","params":{"field":"stored","interval":"auto",' +
        '"customInterval":"2h","min_doc_count":1,"extended_bounds":{}}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d8f180e6310a006d9358c5","query":{"query_string":{"query":"*",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'xApi Verbs Over Time',
        visState: '{"title":"xApi Verbs Over Time","type":"line","params":{"shareYAxis":true,"addTooltip":true,' +
        '"addLegend":true,"showCircles":true,"smoothLines":false,"interpolate":"linear","scale":"linear",' +
        '"drawLinesBetweenPoints":true,"radiusRatio":9,"times":[],"addTimeMarker":false,"defaultYExtents":false,' +
        '"setYExtents":false,"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{}},{"id":"2",' +
        '"type":"date_histogram","schema":"segment","params":{"field":"stored","interval":"auto","customInterval":"2h",' +
        '"min_doc_count":1,"extended_bounds":{}}},{"id":"3","type":"terms","schema":"group","params":{"field":"event.keyword",' +
        '"size":5,"order":"desc","orderBy":"1"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d8f180e6310a006d9358c5","query":{"query_string":{"query":"*",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_'
    },
    {
        title: 'Accesible Accesed (All) per TargetId',
        visState: '{"title":"Accesible Accesed (All) per TargetId","type":"pie","params":{"shareYAxis":true,"addTooltip":true,' +
        '"addLegend":true,"isDonut":false},"aggs":[{"id":"1","type":"count","schema":"metric","params":{}},{"id":"2",' +
        '"type":"terms","schema":"segment","params":{"field":"target.keyword","size":30,"order":"desc","orderBy":"1"}}],' +
        '"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d81e1785b094006eab04d7","query":{"query_string":{"query":"event:accessed",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_'
    }
];
module.exports = defaultVisualizations;