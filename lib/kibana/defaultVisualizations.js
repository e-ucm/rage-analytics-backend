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
        title: 'heatmap',
        visState: '{\"title\":\"heatmap\",\"type\":\"tile_map\",\"params\":{\"mapType\":\"Heatmap\",' +
        '\"isDesaturated\":false,\"addTooltip\":true,\"heatMaxZoom\":\"18\",\"heatMinOpacity\":\"0.3\",' +
        '\"heatRadius\":\"15\",\"heatBlur\":\"7\",\"heatNormalizeData\":true,\"mapZoom\":2,\"mapCenter\":[15,5],' +
        '\"wms\":{\"enabled\":false,\"url\":\"https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer\",' +
        '\"options\":{\"version\":\"1.3.0\",\"layers\":\"0\",\"format\":\"image/png\",\"transparent\":true,' +
        '\"attribution\":\"Open Street Map\",\"styles\":\"\"}}},\"aggs\":[{\"id\":\"1\",\"enabled\":true,' +
        '\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"geohash_grid\",' +
        '\"schema\":\"segment\",\"params\":{\"field\":\"out.ext.location\",\"autoPrecision\":true}}],\"listeners\":{}}',
        uiStateJSON: '{"mapZoom":7,"mapCenter":[40.26276066437183,-3.0267333984375]}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a71de54e6c4130081b4dc0b","query":{"match_all":{}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: false
    },
    {
        title: 'AlternativeSelectedCorrectIncorrectPerQuestionId-Cmn',
        visState: '{"title":"AlternativeSelectedCorrectIncorrectPerQuestionId-Cmn","type":"histogram","params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,"defaultYExtents":false,"mode":"stacked","scale":"linear","setYExtents":false,"shareYAxis":true,"times":[],"yAxis":{},"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{"text":"Alternative"}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal","setYExtents":false,"defaultYExtents":false},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"linear"}],"legendPosition":"right","type":"histogram"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"out.target.keyword","include":"\","size":100,"order":"asc","orderBy":"_term","customLabel":"Alternative"}},{"id":"4","enabled":true,"type":"filters","schema":"group","params":{"filters":[{"input":{"query":{"query_string":{"query":"out.success:true","analyze_wildcard":true}}},"label":"\"},{"input":{"query":{"query_string":{"query":"out.success:false","analyze_wildcard":true}}}}]}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"*Incorrect":"#BF1B00","out.response:Correct":"#3F6833","out.response:Incorrect":"#BF1B00","out.success:true":"#7EB26D","out.success:false":"#E24D42"},"legendOpen":true}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a675c214d3e800080b1963c","query":{"query_string":{"query":"out.event:selected && !out.type:menu","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: true
    },
    {
        title: 'CompletabeCompletedTimes-Cmn',
        visState: '{"title":"CompletabeCompletedTimes-Cmn","type":"histogram","params":{"shareYAxis":true,"addTooltip":true,"addLegend":true,"scale":"linear","mode":"grouped","times":[],"addTimeMarker":false,"defaultYExtents":false,"setYExtents":false,"yAxis":{},"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"grouped","setYExtents":false,"defaultYExtents":false},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":true,"mode":"normal","type":"histogram","drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"linear","data":{"id":"2","label":"Minimum Time"},"valueAxis":"ValueAxis-1"},{"show":"true","type":"histogram","mode":"normal","data":{"label":"Average out.ext.time","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"linear"},{"show":true,"mode":"normal","type":"histogram","drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"linear","data":{"id":"3","label":"Max Time"},"valueAxis":"ValueAxis-1"}],"legendPosition":"right","type":"histogram"},"aggs":[{"id":"2","enabled":true,"type":"min","schema":"metric","params":{"field":"out.ext.time","customLabel":"Minimum Time"}},{"id":"1","enabled":true,"type":"avg","schema":"metric","params":{"field":"out.ext.time"}},{"id":"3","enabled":true,"type":"max","schema":"metric","params":{"field":"out.ext.time","customLabel":"Max Time"}},{"id":"4","enabled":true,"type":"terms","schema":"split","params":{"field":"out.target.keyword","size":15,"order":"desc","orderBy":"_term","customLabel":"Times","row":false}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a675c214d3e800080b1963c","query":{"query_string":{"analyze_wildcard":true,"query":"out.event:completed"}},"filter":[]}'
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
        title: 'VideosSeenSkipped-Cmn',
        visState: '{"title":"VideosSeenSkipped-Cmn","type":"histogram","params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,"defaultYExtents":false,"mode":"stacked","scale":"linear","setYExtents":false,"shareYAxis":true,"times":[],"yAxis":{},"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{"text":"Top 78 unusual terms in out.target.keyword"}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal","setYExtents":false,"defaultYExtents":false},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"linear"}],"legendPosition":"right","type":"histogram"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"\"}},{"id":"2","enabled":true,"type":"filters","schema":"group","params":{"filters":[{"input":{"query":{"query_string":{"analyze_wildcard":true,"query":"out.event:accessed"}}},"label":"\"},{"input":{"query":{"query_string":{"analyze_wildcard":true,"query":"out.event:skipped"}}}}]}},{"id":"3","enabled":true,"type":"significant_terms","schema":"segment","params":{"field":"out.target.keyword","size":78}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"out.event:skipped":"#E5AC0E","out.event:accessed":"#64B0C8"}}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a675c214d3e800080b1963c","query":{"query_string":{"analyze_wildcard":true,"query":"out.type:cutscene"}},"filter":[]}'
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
        title: 'AccesibleAccesedAllperTargetId',
        visState: '{"title":"AccesibleAccesedAllperTargetId","type":"pie","params":{"shareYAxis":true,"addTooltip":true,"addLegend":true,"isDonut":false,"legendPosition":"right","type":"pie"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"\"}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"out.target.keyword","size":30,"order":"desc","orderBy":"1"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a675c214d3e800080b1963c","query":{"query_string":{"query":"out.event:accessed","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    },
    {
        title: 'CompletablesAverageProgressOverTime',
        visState: '{"title":"CompletablesAverageProgressOverTime","type":"line","params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,"defaultYExtents":true,"drawLinesBetweenPoints":true,"interpolate":"linear","radiusRatio":9,"scale":"linear","setYExtents":true,"shareYAxis":true,"showCircles":true,"smoothLines":false,"times":[],"yAxis":{"max":1,"min":0},"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{"text":"out.timestamp per 30 seconds"}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal","setYExtents":true,"defaultYExtents":true,"min":0,"max":1},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Average out.ext.progress"}}],"seriesParams":[{"show":"true","type":"line","mode":"stacked","data":{"label":"Average out.ext.progress","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"linear","radiusRatio":9}],"legendPosition":"right","type":"line"},"aggs":[{"id":"1","enabled":true,"type":"avg","schema":"metric","params":{"field":"out.ext.progress","customLabel":"\"}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"out.timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,"extended_bounds":{}}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"out.target.keyword","size":41,"order":"desc","orderBy":"1"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a6768d44d3e800080b1963e","query":{"query_string":{"analyze_wildcard":true,"query":"out.event:progressed || out.event:initialized || out.event:completed"}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: false
    },
    {
        title: 'GameProgressAverage',
        visState: '{"title":"Game Progress Average","type":"line","params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,' +
        '"defaultYExtents":false,"drawLinesBetweenPoints":true,"interpolate":"linear","radiusRatio":9,"scale":"linear",' +
        '"setYExtents":false,"shareYAxis":true,"showCircles":true,"smoothLines":false,"times":[],"yAxis":{}},"aggs":[{"id":"1",' +
        '"type":"avg","schema":"metric","params":{"field":"out.ext.progress"}},{"id":"2","type":"date_histogram","schema":"segment",' +
        '"params":{"field":"out.timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,"extended_bounds":{}}},{"id":"3",' +
        '"type":"terms","schema":"group","params":{"field":"out.name.keyword","size":200,"order":"desc","orderBy":"_term"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d8f180e6310a006d9358c5",' +
            '"query":{"query_string":{"query":"out.target:juegocompleto && out.event:progressed","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: false
    },
    {
        title: 'GamesStartedCompleted',
        visState: '{"title":"GamesStartedCompleted","type":"pie","params":{"addLegend":true,"addTooltip":true,"isDonut":false,"shareYAxis":true,"legendPosition":"right","type":"pie"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"\"}},{"id":"2","enabled":true,"type":"filters","schema":"segment","params":{"filters":[{"input":{"query":{"query_string":{"analyze_wildcard":true,"query":"out.event:initialized"}}},"label":"Started"},{"input":{"query":{"query_string":{"analyze_wildcard":true,"query":"out.event:completed"}}},"label":"Completed"}]}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"Completed":"#629E51","Started":"#0A50A1","out.event:completed":"#7EB26D","out.event:initialized":"#447EBC"}}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a6768d44d3e800080b1963e","query":{"query_string":{"analyze_wildcard":true,"query":"out.target:JuegoCompleto"}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: false
    },
    {
        title: 'MaxCompletableScoresperPlayer',
        visState: '{"title":"MaxCompletableScoresperPlayer","type":"histogram","params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,"defaultYExtents":false,"mode":"stacked","scale":"linear","setYExtents":false,"shareYAxis":true,"times":[],"yAxis":{},"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal","setYExtents":false,"defaultYExtents":false},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Max out.score"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Max out.score","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"linear"}],"legendPosition":"right","type":"histogram"},"aggs":[{"id":"1","enabled":true,"type":"max","schema":"metric","params":{"field":"out.score","customLabel":"\"}},{"id":"2","enabled":true,"type":"terms","schema":"split","params":{"field":"out.name.keyword","size":100,"order":"desc","orderBy":"1","customLabel":"Player","row":false}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"out.target.keyword","size":50,"order":"desc","orderBy":"1"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a6768d44d3e800080b1963e","query":{"query_string":{"analyze_wildcard":true,"query":"out.event:completed"}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: false
    },
    {
        title: 'AllGameProgressperplayer-Maxprogress',
        visState: '{"title":"AllGameProgressperplayer-Maxprogress","type":"histogram","params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,"defaultYExtents":false,"mode":"grouped","scale":"linear","setYExtents":false,"shareYAxis":true,"times":[],"yAxis":{},"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{"text":"out.name.keyword: Descending"}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"grouped","setYExtents":false,"defaultYExtents":false},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Max out.ext.progress"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"normal","data":{"label":"Max out.ext.progress","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"linear"}],"legendPosition":"right","type":"histogram"},"aggs":[{"id":"1","enabled":true,"type":"max","schema":"metric","params":{"field":"out.ext.progress","customLabel":"\"}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"out.name.keyword","size":43,"order":"desc","orderBy":"1"}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"out.target.keyword","size":14,"order":"asc","orderBy":"_term"}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"Atragantamiento":"#70DBED","DolorToracico":"#1F78C1","Inconsciente":"#614D93","JuegoCompleto":"#890F02"},"legendOpen":true}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a6768d44d3e800080b1963e","query":{"query_string":{"analyze_wildcard":true,"query":"out.event:progressed"}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: false
    },
    {
        title: 'AlternativeSelected-Question-CountPerTargetIDs',
        visState: '{"title":"AlternativeSelected-Question-CountPerTargetIDs","type":"histogram","params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,"defaultYExtents":false,"mode":"stacked","scale":"linear","setYExtents":false,"shareYAxis":true,"times":[],"yAxis":{},"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{"text":"out.target.keyword: Ascending"}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal","setYExtents":false,"defaultYExtents":false},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"linear"}],"legendPosition":"right","type":"histogram"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"\"}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"out.target.keyword","include":"\","size":12,"order":"asc","orderBy":"_term"}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"out.response.keyword","size":25,"order":"desc","orderBy":"1"}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"*Incorrect":"#BF1B00","out.response:Correct":"#3F6833","out.response:Incorrect":"#BF1B00"}}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a6768d44d3e800080b1963e","query":{"query_string":{"analyze_wildcard":true,"query":"out.event:selected && out.type:question"}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: false
    },
    {
        title: 'AlternativeSelectedCorrectIncorrect',
        visState: '{"title":"AlternativeSelectedCorrectIncorrect","type":"histogram","params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,"defaultYExtents":false,"mode":"stacked","scale":"linear","setYExtents":false,"shareYAxis":true,"times":[],"yAxis":{},"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{"text":"out.name.keyword: Descending"}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal","setYExtents":false,"defaultYExtents":false},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"linear"}],"legendPosition":"right","type":"histogram"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"\"}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"out.name.keyword","include":"\","size":12,"order":"desc","orderBy":"_term"}},{"id":"4","enabled":true,"type":"filters","schema":"group","params":{"filters":[{"input":{"query":{"query_string":{"query":"out.success:true","analyze_wildcard":true}}},"label":"\"},{"input":{"query":{"query_string":{"query":"out.success:false","analyze_wildcard":true}}}}]}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"*Incorrect":"#BF1B00","out.response:Correct":"#3F6833","out.response:Incorrect":"#BF1B00","out.success:true":"#7EB26D","out.success:false":"#E24D42"}}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a6768d44d3e800080b1963e","query":{"query_string":{"query":"out.event:selected","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: false
    },
    {
        title: 'AccesibleAccesedperTargetId',
        visState: '{"title":"AccesibleAccesedperTargetId","type":"pie","params":{"shareYAxis":true,"addTooltip":true,"addLegend":true,"isDonut":false,"legendPosition":"right","type":"pie"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"out.target.keyword","size":100,"order":"desc","orderBy":"1","customLabel":"\"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a675c214d3e800080b1963c","query":{"query_string":{"query":"out.event:accessed && out.type:cutscene","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    },
    {
        title: 'CompletablesCompletedperTarget',
        visState: '{"title":"CompletablesCompletedperTarget","type":"pie","params":{"shareYAxis":true,"addTooltip":true,"addLegend":true,"isDonut":false,"legendPosition":"right","type":"pie"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"\"}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"out.target.keyword","size":100,"order":"desc","orderBy":"1"}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"Inconsciente":"#EAB839"}}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a675c214d3e800080b1963c","query":{"query_string":{"query":"out.event:completed","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    },
    {
        title: 'xAPIVerbsActivity',
        visState: '{"title":"xAPIVerbsActivity","type":"histogram","params":{"shareYAxis":true,"addTooltip":true,"addLegend":true,"scale":"linear","mode":"stacked","times":[],"addTimeMarker":false,"defaultYExtents":false,"setYExtents":false,"yAxis":{},"grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{"text":"xAPI Verb"}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal","setYExtents":false,"defaultYExtents":false},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Activity Counting"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Activity Counting","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"linear"}],"legendPosition":"right","type":"histogram"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Activity Counting"}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"out.event.keyword","size":15,"order":"desc","orderBy":"1","customLabel":"xAPI Verb"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"5a675c214d3e800080b1963c","query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    }
];
module.exports = defaultVisualizations;
