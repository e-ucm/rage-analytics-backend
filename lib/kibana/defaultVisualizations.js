'use strict';

var defaultVisualizations = [
    {
        title: 'TimePicker',
        visState: '{"title":"TimePicker","type":"time","params":{"enable_quick":true,"enable_relative":true,' +
        '"enable_absolut":true,"enable_animation":true},"aggs":[],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d6db099348f3006efbdb7a", "query":{"query_string":{"query":"*","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: true
    },
    {
        title: 'BiasesBarPercentageViss',
        visState: '{"title":"BiasesBarPercentageViss","type":"histogram","params":' +
        '{"addLegend":true,"addTimeMarker":false,"addTooltip":true,"defaultYExtents":false,' +
        '"mode":"percentage","scale":"linear","setYExtents":false,"shareYAxis":true,"times":[],' +
        '"yAxis":{}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric",' +
        '"params":{"customLabel":"Percentage"}},{"id":"2","enabled":true,"type":"terms",' +
        '"schema":"segment","params":{"field":"bias_type.keyword","size":40,"order":"asc",' +
        '"orderBy":"_term","customLabel":"Biases"}},{"id":"3","enabled":true,"type":"filters",' +
        '"schema":"group","params":{"filters":[{"input":{"query":{"query_string":{"query":' +
        '"bias_value_true:1","analyze_wildcard":true}}},"label":".True"},{"input":{"query":' +
        '{"query_string":{"query":"bias_value_false:1","analyze_wildcard":true}}},"label":"False"}]}}],' +
        '"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"bias_value_false:1":"#052B51","bias_value_true:1":"#82B5D8",' +
        '".True":"#0A50A1","False":"#82B5D8"},"legendOpen":false}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"thomaskilmann-57d6db099348f3006efbdb7a","query":{"query_string":' +
            '{"query":"_type:thomasKilmann","analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: false
    },
    {
        title: 'ThomasKilmannOverTimeSwimline',
        visState: '{"title":"ThomasKilmannOverTimeSwimline","type":"prelert_swimlane","params":{"interval":' +
        '{"display":"Auto","val":"auto"},"lowThreshold":1,"warningThreshold":2,"minorThreshold":3,"majorThreshold":4,' +
        '"criticalThreshold":5,"tooltipNumberFormat":"0.0"},"aggs":[{"id":"1","enabled":true,"type":"max","schema":' +
        '"metric","params":{"field":"tkscripted","customLabel":"Thomas Kilmann"}},{"id":"2","enabled":true,"type":' +
        '"terms","schema":"viewBy","params":{"field":"out.ext.thomasKilmann.keyword","size":10,"order":"desc","orderBy":' +
        '"1","customLabel":"Thomas Kilmann"}},{"id":"3","enabled":true,"type":"date_histogram","schema":"timeSplit",' +
        '"params":{"field":"out.timestamp","interval":"auto","customInterval":"30m","min_doc_count":1,"extended_bounds":{},' +
        '"customLabel":"Time"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"thomaskilmann-57d6db099348f3006efbdb7a","query":{"query_string":{"analyze_wildcard":true,' +
            '"query":"*"}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: false
    },
    {
        title: 'ThomasKilmannClassificationPieChart',
        visState: '{"title":"ThomasKilmannClassificationPieChart","type":"pie","params":{"shareYAxis":true,"addTooltip":true,' +
        '"addLegend":true,"legendPosition":"right","isDonut":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric",' +
        '"params":{"customLabel":"Count/Percentage"}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params"' +
        ':{"field":"out.ext.thomasKilmann.keyword","size":15,"order":"desc","orderBy":"1","customLabel":' +
        '"Thomas Kilmann Classification"}}],"listeners":{}}',
        uiStateJSON: '{"spy":{"mode":{"name":null,"fill":false}},"vis":{"legendOpen":true}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d6db099348f3006efbdb7a","query":{"query_string":{"query":"*",' +
        '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: false
    },
    {
        title: 'ThomasKilmannClassificationBoxesWidget',
        visState: '{\"aggs\":[{\"enabled\":true,\"id\":\"1\",\"params\":{},\"schema\":\"metric\",\"type\":\"count\"},' +
        '{\"enabled\":true,\"id\":\"2\",\"params\":{\"field\":\"out.ext.thomasKilmann.keyword\",\"order\":\"desc\",' +
        '\"orderBy\":\"1\",\"size\":10},\"schema\":\"buckets\",\"type\":\"terms\"}],\"listeners\":{},' +
        '\"params\":{\"color1\":\"#1f77b4\",\"color2\":\"#ff7f0e\",\"color3\":\"#2ca02c\",\"color4\":\"#d62728\",' +
        '\"color5\":\"#9467bd\",\"legend_position\":\"right\"},\"title\":\"ThomasKilmannClassificationBoxesWidget\",' +
        '\"type\":\"tkWidget\"}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{\"index\":\"57d6db099348f3006efbdb7a\",\"query\":{\"query_string\":{\"analyze_wildcard\":true,' +
            '\"query\":\"*\"}},\"filter\":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: false
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
        uiStateJSON: '{\"mapZoom\":4,\"mapCenter\":[20.612219573881042,45.516357421875]}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{\"index\":\"57d6db099348f3006efbdb7a\",\"query\":{\"query_string\":{\"analyze_wildcard\":true,' +
            '\"query\":\"*\"}},\"filter\":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: false
    },
    {
        title: 'AlternativeSelectedCorrectIncorrectPerQuestionId-Cmn',
        visState: '{"title":"Alternative Selected Correct Incorrect Per QuestionId","type":"histogram",' +
        '"params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,"defaultYExtents":false,"mode":"stacked",' +
        '"scale":"linear","setYExtents":false,"shareYAxis":true,"times":[],"yAxis":{}},"aggs":[{"id":"1","type":"count",' +
        '"schema":"metric","params":{}},{"id":"2","type":"terms","schema":"segment","params":{"field":"out.target.keyword",' +
        '"include":{"pattern":""},"size":100,"order":"asc","orderBy":"_term","customLabel":"Alternative"}},{"id":"4",' +
        '"type":"filters","schema":"group","params":{"filters":[{"input":{"query":{"query_string":{"query":"out.success:true"' +
        ',"analyze_wildcard":true}}},"label":""},{"input":{"query":{"query_string":{"query":"out.success:false",' +
        '"analyze_wildcard":true}}}}]}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"*Incorrect":"#BF1B00","out.response:Correct":"#3F6833","out.response:Incorrect":"#BF1B00",' +
        '"out.success:true":"#7EB26D","out.success:false":"#E24D42"},"legendOpen":true}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d6db099348f3006efbdb7a","query":{"query_string":{"query":"out.event:selected && !out.type:menu",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: true
    },
    {
        title: 'CompletabeCompletedTimes-Cmn',
        visState: '{"title":"Completabe Completed Times","type":"histogram","params":{"shareYAxis":true,"addTooltip":true,' +
        '"addLegend":true,"scale":"linear","mode":"grouped","times":[],"addTimeMarker":false,"defaultYExtents":false,' +
        '"setYExtents":false,"yAxis":{}},"aggs":[{"id":"2","type":"min","schema":"metric","params":{"field":"out.ext.time",' +
        '"customLabel":"Min Time"}},{"id":"1","type":"avg","schema":"metric","params":{"field":"out.ext.time"}},{"id":"3","type":"max",' +
        '"schema":"metric","params":{"field":"out.ext.time","customLabel":"Max Time"}},{"id":"4","type":"terms","schema":"split",' +
        '"params":{"field":"out.target.keyword","size":15,"order":"desc","orderBy":"_term","customLabel":"Times","row":false}}],' +
        '"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d81e1785b094006eab04d7","query":{"query_string":{"analyze_wildcard":true,' +
            '"query":"out.event:completed"}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: true
    },
    {
        title: 'TotalSessionPlayers-Cmn',
        visState: '{"title":"Total Session Players","type":"metric","params":{"handleNoResults":true,"fontSize":60},' +
        '"aggs":[{"id":"1","type":"cardinality","schema":"metric","params":{"field":"out.name.keyword","customLabel":"SessionPlayers"}}],' +
        '"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57604f53f552624300d9caa6","query":{"query_string":{"query":"*",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: true
    },
    {
        title: 'VideosSeenSkipped-Cmn',
        visState: '{"title":"Videos Seen - Skipped","type":"histogram","params":{"addLegend":true,"addTimeMarker":false,' +
        '"addTooltip":true,"defaultYExtents":false,"mode":"stacked","scale":"linear","setYExtents":false,"shareYAxis":true,' +
        '"times":[],"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{}},{"id":"2","type":"filters",' +
        '"schema":"group","params":{"filters":[{"input":{"query":{"query_string":{"analyze_wildcard":true,' +
        '"query":"out.event:accessed"}}},"label":""},{"input":{"query":{"query_string":{"analyze_wildcard":true,' +
        '"query":"out.event:skipped"}}}}]}},{"id":"3","type":"significant_terms","schema":"segment",' +
        '"params":{"field":"out.target.keyword","size":78}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"out.event:skipped":"#E5AC0E","out.event:accessed":"#64B0C8"}}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d81e1785b094006eab04d7","query":{"query_string":{"analyze_wildcard":true,' +
            '"query":"out.type:cutscene"}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: true
    },
    {
        title: 'SessionActivityOverTime',
        visState: '{"title":"Session Activity Over Time","type":"line","params":{"shareYAxis":true,"addTooltip":true,' +
        '"addLegend":true,"showCircles":true,"smoothLines":false,"interpolate":"linear","scale":"linear",' +
        '"drawLinesBetweenPoints":true,"radiusRatio":9,"times":[],"addTimeMarker":false,"defaultYExtents":false,' +
        '"setYExtents":false,"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{}},' +
        '{"id":"2","type":"date_histogram","schema":"segment","params":{"field":"out.timestamp","interval":"auto",' +
        '"customInterval":"2h","min_doc_count":1,"extended_bounds":{}}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d8f180e6310a006d9358c5","query":{"query_string":{"query":"*",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    },
    {
        title: 'xApiVerbsOverTime',
        visState: '{"title":"xApi Verbs Over Time","type":"line","params":{"shareYAxis":true,"addTooltip":true,' +
        '"addLegend":true,"showCircles":true,"smoothLines":false,"interpolate":"linear","scale":"linear",' +
        '"drawLinesBetweenPoints":true,"radiusRatio":9,"times":[],"addTimeMarker":false,"defaultYExtents":false,' +
        '"setYExtents":false,"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{}},{"id":"2",' +
        '"type":"date_histogram","schema":"segment","params":{"field":"out.timestamp","interval":"auto","customInterval":"2h",' +
        '"min_doc_count":1,"extended_bounds":{}}},{"id":"3","type":"terms","schema":"group","params":{"field":"out.event.keyword",' +
        '"size":5,"order":"desc","orderBy":"1"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d8f180e6310a006d9358c5","query":{"query_string":{"query":"*",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    },
    {
        title: 'AccesibleAccesedAllperTargetId',
        visState: '{"title":"Accesible Accesed (All) per TargetId","type":"pie","params":{"shareYAxis":true,"addTooltip":true,' +
        '"addLegend":true,"isDonut":false},"aggs":[{"id":"1","type":"count","schema":"metric","params":{}},{"id":"2",' +
        '"type":"terms","schema":"segment","params":{"field":"out.target.keyword","size":30,"order":"desc","orderBy":"1"}}],' +
        '"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d81e1785b094006eab04d7","query":{"query_string":{"query":"out.event:accessed",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    },
    {
        title: 'CompletablesAverageProgressOverTime',
        visState: '{"title":"Completables Average Progress Over Time","type":"line","params":{"addLegend":true,"addTimeMarker":false,' +
        '"addTooltip":true,"defaultYExtents":true,"drawLinesBetweenPoints":true,"interpolate":"linear","radiusRatio":9,"scale":"linear",' +
        '"setYExtents":true,"shareYAxis":true,"showCircles":true,"smoothLines":false,"times":[],"yAxis":{"max":1,"min":0}},' +
        '"aggs":[{"id":"1","type":"avg","schema":"metric","params":{"field":"out.ext.progress"}},{"id":"2","type":"date_histogram",' +
        '"schema":"segment","params":{"field":"out.timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,"extended_bounds":{}}},' +
        '{"id":"3","type":"terms","schema":"group","params":{"field":"out.target.keyword","size":41,"order":"desc","orderBy":"1"}}],' +
        '"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d807ad7afba7006d7d435d","query":{"query_string":{"analyze_wildcard":true,' +
            '"query":"out.event:progressed || out.event:initialized || out.event:completed"}},"filter":[]}'
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
        visState: '{"aggs":[{"id":"1","params":{},"schema":"metric","type":"count"},' +
        '{"id":"2","params":{"filters":[{"input":{"query":{"query_string":{"analyze_wildcard":true,"query":"out.event:initialized"}}},' +
        '"label":"Started"},{"input":{"query":{"query_string":{"analyze_wildcard":true,"query":"out.event:completed"}}},"label":"Completed"}]},' +
        '"schema":"segment","type":"filters"}],"listeners":{},"params":{"addLegend":true,"addTooltip":true,"isDonut":false,"shareYAxis":true},' +
        '"title":"Games Started / Completed","type":"pie"}',
        uiStateJSON: '{"vis":{"colors":{"Completed":"#629E51","Started":"#0A50A1","out.event:completed":"#7EB26D","out.event:initialized":"#447EBC"}}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d81e1785b094006eab04d7","query":{"query_string":{"analyze_wildcard":true,' +
            '"query":"out.target:JuegoCompleto"}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: false
    },
    {
        title: 'MaxCompletableScoresperPlayer',
        visState: '{"aggs":[{"enabled":true,"id":"1","params":{"field":"out.score"},"schema":"metric","type":"max"},{"enabled":true,' +
        '"id":"2","params":{"customLabel":"Player","field":"out.name.keyword","order":"desc","orderBy":"1","row":false,"size":100},' +
        '"schema":"split","type":"terms"},{"enabled":true,"id":"3","params":{"field":"out.target.keyword","order":"desc","orderBy":"1",' +
        '"size":50},"schema":"group","type":"terms"}],"listeners":{},"params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,' +
        '"defaultYExtents":false,"mode":"stacked","scale":"linear","setYExtents":false,"shareYAxis":true,"times":[],"yAxis":{}},' +
        '"title":"Max Completable Scores per Player","type":"histogram"}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57db3cf93a3d13006ec92d95","query":{"query_string":{"analyze_wildcard":true,' +
            '"query":"out.event:completed"}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: false
    },
    {
        title: 'AllGameProgressperplayer-Maxprogress',
        visState: '{"aggs":[{"id":"1","params":{"field":"out.ext.progress"},"schema":"metric","type":"max"},{"id":"2",' +
        '"params":{"field":"out.name.keyword","order":"desc","orderBy":"1","size":43},"schema":"segment","type":"terms"},' +
        '{"id":"3","params":{"field":"out.target.keyword","order":"asc","orderBy":"_term","size":14},"schema":"group",' +
        '"type":"terms"}],"listeners":{},"params":{"addLegend":true,"addTimeMarker":false,"addTooltip":true,"defaultYExtents":false,' +
        '"mode":"grouped","scale":"linear","setYExtents":false,"shareYAxis":true,"times":[],"yAxis":{}},' +
        '"title":"All Game Progress per player (Max progress)","type":"histogram"}',
        uiStateJSON: '{"vis":{"colors":{"Atragantamiento":"#70DBED","DolorToracico":"#1F78C1","Inconsciente":"#614D93",' +
        '"JuegoCompleto":"#890F02"},"legendOpen":true}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d8f180e6310a006d9358c5","query":{"query_string":{"analyze_wildcard":true,' +
            '"query":"out.event:progressed"}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: false
    },
    {
        title: 'AlternativeSelected-Question-CountPerTargetIDs',
        visState: '{"title":"Alternative Selected (Question) Count Per Target IDs","type":"histogram","params":{"addLegend":true,' +
        '"addTimeMarker":false,"addTooltip":true,"defaultYExtents":false,"mode":"stacked","scale":"linear","setYExtents":false,' +
        '"shareYAxis":true,"times":[],"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{}},{"id":"2",' +
        '"type":"terms","schema":"segment","params":{"field":"out.target.keyword","include":{"pattern":""},"size":12,"order":"asc",' +
        '"orderBy":"_term"}},{"id":"3","type":"terms","schema":"group","params":{"field":"out.response.keyword","size":25,' +
        '"order":"desc","orderBy":"1"}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"*Incorrect":"#BF1B00","out.response:Correct":"#3F6833","out.response:Incorrect":"#BF1B00"}}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d6db099348f3006efbdb7a","query":{"query_string":{"analyze_wildcard":true,' +
            '"query":"out.event:selected && out.type:question"}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: false
    },
    {
        title: 'AlternativeSelectedCorrectIncorrect',
        visState: '{"title":"Alternative Selected Correct Incorrect","type":"histogram","params":{"addLegend":true,' +
        '"addTimeMarker":false,"addTooltip":true,"defaultYExtents":false,"mode":"stacked","scale":"linear","setYExtents":false,' +
        '"shareYAxis":true,"times":[],"yAxis":{}},"aggs":[{"id":"1","type":"count","schema":"metric","params":{}},{"id":"2",' +
        '"type":"terms","schema":"segment","params":{"field":"out.name.keyword","include":{"pattern":""},"size":12,"order":"desc",' +
        '"orderBy":"_term"}},{"id":"4","type":"filters","schema":"group",' +
        '"params":{"filters":[{"input":{"query":{"query_string":{"query":"out.success:true","analyze_wildcard":true}}},"label":""},' +
        '{"input":{"query":{"query_string":{"query":"out.success:false","analyze_wildcard":true}}}}]}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"*Incorrect":"#BF1B00","out.response:Correct":"#3F6833","out.response:Incorrect":"#BF1B00",' +
        '"out.success:true":"#7EB26D","out.success:false":"#E24D42"}}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d6db099348f3006efbdb7a","query":{"query_string":{"query":"out.event:selected",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: true,
        isDeveloper: false
    },
    {
        title: 'AccesibleAccesedperTargetId',
        visState: '{"title":"Accesible Accesed per TargetId","type":"pie","params":{"shareYAxis":true,"addTooltip":true,"addLegend":true,' +
        '"isDonut":false},"aggs":[{"id":"1","type":"count","schema":"metric","params":{}},{"id":"2","type":"terms","schema":"segment",' +
        '"params":{"field":"out.target.keyword","size":100,"order":"desc","orderBy":"1"}}],"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d81e1785b094006eab04d7","query":{"query_string":{"query":"out.event:accessed && out.type:cutscene",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    },
    {
        title: 'CompletablesCompletedperTarget',
        visState: '{"title":"Completables Completed per Target","type":"pie","params":{"shareYAxis":true,"addTooltip":true,' +
        '"addLegend":true,"isDonut":false},"aggs":[{"id":"1","type":"count","schema":"metric","params":{}},{"id":"2","type":"terms",' +
        '"schema":"segment","params":{"field":"out.target.keyword","size":100,"order":"desc","orderBy":"1"}}],"listeners":{}}',
        uiStateJSON: '{"vis":{"colors":{"Inconsciente":"#EAB839"}}}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57d81e1785b094006eab04d7","query":{"query_string":{"query":"out.event:completed",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    },
    {
        title: 'xAPIVerbsActivity',
        visState: '{"title":"xAPI Verbs Activity","type":"histogram","params":{"shareYAxis":true,"addTooltip":true,"addLegend":true,' +
        '"scale":"linear","mode":"stacked","times":[],"addTimeMarker":false,"defaultYExtents":false,"setYExtents":false,"yAxis":{}},' +
        '"aggs":[{"id":"1","type":"count","schema":"metric","params":{"customLabel":"Activity Count"}},{"id":"2","type":"terms",' +
        '"schema":"segment","params":{"field":"out.event.keyword","size":15,"order":"desc","orderBy":"1","customLabel":"xAPI Verb"}}],' +
        '"listeners":{}}',
        uiStateJSON: '{}',
        description: '',
        version: 1,
        kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"57604f53f552624300d9caa6","query":{"query_string":{"query":"*",' +
            '"analyze_wildcard":true}},"filter":[]}'
        },
        author: '_default_',
        isTeacher: false,
        isDeveloper: true
    }
];
module.exports = defaultVisualizations;
