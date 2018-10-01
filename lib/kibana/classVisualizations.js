'use strict';

var defaultVisualizations = [
    {
        title: 'TimePicker',
        visState: '{"title":"TimePicker","type":"time","params":{"enable_quick":true,"enable_relative":true,"enable_absolut":true,"enable_animation":true,"type":"time","animation_frame_delay":null},"aggs":[],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a675c214d3e800080b1963c","query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: true
    },
    {
        title: 'TotalSessionPlayers-Cmn',
        visState: '{"title":"TotalSessionPlayers-Cmn","type":"metric","params":{"handleNoResults":true,"addTooltip":true,"addLegend":false,"type":"gauge","gauge":{"verticalSplit":false,"autoExtend":false,"percentageMode":false,"gaugeType":"Metric","gaugeStyle":"Full","backStyle":"Full","orientation":"vertical","colorSchema":"Green to Red","gaugeColorMode":"None","useRange":false,"colorsRange":[{"from":0,"to":100}],"invertColors":false,"labels":{"show":true,"color":"black"},"scale":{"show":false,"labels":false,"color":"#333","width":2},"type":"simple","style":{"fontSize":60,"bgColor":false,"labelColor":false,"subText":"\"}}},"aggs":[{"id":"1","enabled":true,"type":"cardinality","schema":"metric","params":{"field":"out.name.keyword","customLabel":"Session Players"}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"defaultColors":{"0 - 100":"rgb(0,104,55)"}}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a675c214d3e800080b1963c","query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: true
    },
    {
        title: 'SessionActivityOverTime',
        visState: '{"title":"SessionActivityOverTime","type":"line","params":{"shareYAxis":true,"addTooltip":true,"addLegend":true,"showCircles":true,"smoothLines":false,"interpolate":"linear","scale":"linear","drawLinesBetweenPoints":true,"radiusRatio":9,"times":[],"addTimeMarker":false,"defaultYExtents":false,"setYExtents":false,"yAxis":{},"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{"text":"out.timestamp per 30 seconds"}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal","setYExtents":false,"defaultYExtents":false},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"line","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"linear","radiusRatio":9}],"legendPosition":"right","type":"line"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"\"}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"out.timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,"extended_bounds":{}}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a675c214d3e800080b1963c","query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    },
    {
        title: 'xApiVerbsOverTime',
        visState: '{"title":"xApiVerbsOverTime","type":"line","params":{"shareYAxis":true,"addTooltip":true,"addLegend":true,"showCircles":true,"smoothLines":false,"interpolate":"linear","scale":"linear","drawLinesBetweenPoints":true,"radiusRatio":9,"times":[],"addTimeMarker":false,"defaultYExtents":false,"setYExtents":false,"yAxis":{},"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{"text":"out.timestamp per 30 seconds"}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal","setYExtents":false,"defaultYExtents":false},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"line","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"linear","radiusRatio":9}],"legendPosition":"right","type":"line"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"\"}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"out.timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,"extended_bounds":{}}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"out.event.keyword","size":5,"order":"desc","orderBy":"1"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a675c214d3e800080b1963c","query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    },
    {
        title: 'ActivitiesAverageScoreOverTime',
        visState: '{"title":"ActivitiesAverageScoreOverTime","type":"line","params":{"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{"text":"Time"}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Average Score"}}],"seriesParams":[{"show":"true","type":"line","mode":"normal","data":{"label":"Average Score","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"type":"line"},"aggs":[{"id":"1","enabled":true,"type":"avg","schema":"metric","params":{"field":"out.score","customLabel":"Average Score"}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"out.timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,"extended_bounds":{},"customLabel":"Time"}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"activityName.keyword","size":5,"order":"desc","orderBy":"1","customLabel":"Activities"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{\"index\":\"AWXYPOEuQtTMNnrMvjac\",\"query\":{\"match_all\":{}},\"filter\":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    },
    {
        title: 'ActivitiesAverageProgressOverTime',
        visState: '{"title":"ActivitiesAverageProgressOverTime","type":"line","params":{"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{"text":"Time"}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Average Progress"}}],"seriesParams":[{"show":"true","type":"line","mode":"normal","data":{"label":"Average Progress","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"type":"line"},"aggs":[{"id":"1","enabled":true,"type":"avg","schema":"metric","params":{"field":"out.ext.progress","customLabel":"Average Progress"}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"out.timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,"extended_bounds":{},"customLabel":"Time"}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"activityName.keyword","size":5,"order":"desc","orderBy":"1","customLabel":"Activities"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{\"index\":\"AWXYPOEuQtTMNnrMvjac\",\"query\":{\"match_all\":{}},\"filter\":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    },
    {
        title: 'ActivitiesTracesOverTime',
        visState: '{"title":"ActivitiesTracesOverTime","type":"line","params":{"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{"text":"Time"}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Traces Count"}}],"seriesParams":[{"show":"true","type":"line","mode":"normal","data":{"label":"Traces Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"type":"line"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Traces Count"}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"out.timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,"extended_bounds":{},"customLabel":"Time"}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"activityName.keyword","size":5,"order":"desc","orderBy":"1","customLabel":"Activities"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{\"index\":\"AWXYPOEuQtTMNnrMvjac\",\"query\":{\"match_all\":{}},\"filter\":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    },
    {
        title: 'TableActivitiesPlayersTotalTracesSent',
        visState: '{"title":"TableActivitiesPlayersTotalTracesSent","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum","type":"table"},"aggs":[{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"activityName.keyword","size":5,"order":"desc","orderBy":"1","customLabel":"Activities"}},{"id":"1","enabled":true,"type":"cardinality","schema":"metric","params":{"field":"out.name.keyword","customLabel":"Players"}},{"id":"3","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Total Traces sent"}}],"listeners":{}}',
        uiStateJSON: '{\"vis\":{\"params\":{\"sort\":{\"columnIndex\":null,\"direction\":null}}}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{\"index\":\"AWXYPOEuQtTMNnrMvjac\",\"query\":{\"match_all\":{}},\"filter\":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    }
];
module.exports = defaultVisualizations;
