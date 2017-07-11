'use strict';

var traces = [
    {
        id:"vis_id1000",
        type: "visualization",
        source:{
            title:"visualization_title",
            visState:"{\"title\":\"visualization_title\",\"type\":\"histogram\",\"params\":{\"shareYAxis\":true,\"addTooltip\":true,\"addLegend\":true,\"scale\":\"linear\",\"mode\":\"stacked\",\"times\":[],\"addTimeMarker\":false,\"defaultYExtents\":false,\"setYExtents\":false,\"yAxis\":{}},\"aggs\":[{\"id\":\"1\",\"type\":\"count\",\"schema\":\"metric\",\"params\":{\"customLabel\":\"Activity Count\"}},{\"id\":\"2\",\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"ext.extension.keyword\",\"size\":15,\"order\":\"desc\",\"orderBy\":\"1\",\"customLabel\":\"extension test\"}}],\"listeners\":{}}",
            uiStateJSON:"{}",
            description:"",
            version:1,
            kibanaSavedObjectMeta:{
                searchSourceJSON:"{\"index\":\"index_id\",\"query\":{\"query_string\":{\"query\":\"*\",\"analyze_wildcard\":true}},\"filter\":[]}"
            },
            author:"_default_",
            isTeacher:false,
            isDeveloper:true
        }
    },
    {
        id:"vis_id2000",
        type: "visualization",
        source:{
            title:"visualization_title",
            visState:"{\"title\":\"visualization_title\",\"type\":\"histogram\",\"params\":{\"shareYAxis\":true,\"addTooltip\":true,\"addLegend\":true,\"scale\":\"linear\",\"mode\":\"stacked\",\"times\":[],\"addTimeMarker\":false,\"defaultYExtents\":false,\"setYExtents\":false,\"yAxis\":{}},\"aggs\":[{\"id\":\"1\",\"type\":\"count\",\"schema\":\"metric\",\"params\":{\"customLabel\":\"Activity Count\"}},{\"id\":\"2\",\"type\":\"terms\",\"schema\":\"segment\",\"params\":{\"field\":\"ext.extension\",\"size\":1,\"order\":\"desc\",\"orderBy\":\"1\",\"customLabel\":\"estension test\"}}],\"listeners\":{}}",
            uiStateJSON:"{}",
            description:"",
            version:1,
            kibanaSavedObjectMeta:{
                searchSourceJSON:"{\"index\":\"index_id\",\"query\":{\"query_string\":{\"query\":\"*\",\"analyze_wildcard\":true}},\"filter\":[]}"
            },
            author:"_default_",
            isTeacher:false,
            isDeveloper:true
        }
    },
    {
        id:"vis_id3000",
        type:"visualization",
        source:{
            title:"visualization_title",
            visState:"{\"title\":\"visualization_title\",\"type\":\"histogram\",\"params\":{\"shareYAxis\":true,\"addTooltip\":true,\"addLegend\":true,\"scale\":\"linear\",\"mode\":\"grouped\",\"times\":[],\"addTimeMarker\":false,\"defaultYExtents\":false,\"setYExtents\":false,\"yAxis\":{}},\"aggs\":[{\"id\":\"2\",\"type\":\"min\",\"schema\":\"metric\",\"params\":{\"field\":\"ext.dt\",\"customLabel\":\"Min Time\"}},{\"id\":\"1\",\"type\":\"avg\",\"schema\":\"metric\",\"params\":{\"field\":\"ext.extension.objectKey.subkey.keyword\"}},{\"id\":\"3\",\"type\":\"max\",\"schema\":\"metric\",\"params\":{\"field\":\"event.keyword\",\"customLabel\":\"Max Time\"}},{\"id\":\"4\",\"type\":\"terms\",\"schema\":\"split\",\"params\":{\"field\":\"target.keyword\",\"size\":15,\"order\":\"desc\",\"orderBy\":\"_term\",\"customLabel\":\"Times\",\"row\":false}}],\"listeners\":{}}",
            uiStateJSON:"{}",
            description:"",
            version:1,
            kibanaSavedObjectMeta:{
                searchSourceJSON:"{\"index\":\"index-id\",\"query\":{\"query_string\":{\"analyze_wildcard\":true,\"query\":\"event:completed\"}},\"filter\":[]}"
            },
            author:"_default_",
            isTeacher:true,
            isDeveloper:true
        }
    },
    {
        id:"index_id1000",
        type:"index-pattern",
        source:{
            title:"58935a97e6806a006e3ae7bd",
            timeFieldName:"timestamp",
            fields:"[{\"name\":\"type\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":false},{\"name\":\"gameplayId\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":false},{\"name\":\"ext.extension.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"type_hashCode\",\"type\":\"number\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"ext.dt\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":false},{\"name\":\"ext.checkExt\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":false},{\"name\":\"score\",\"type\":\"number\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"response.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"ext.gameplay\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":false},{\"name\":\"ext.extension2.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"type.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"ext.ayuda\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":false},{\"name\":\"event_hashCode\",\"type\":\"number\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"ext.ayuda.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"ext.mobile\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":false},{\"name\":\"target.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"name.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true}]"
        }
    },
    {
        id:"index_id2000",
        type:"index",
        source:{
            title:"58935a97e6806a006e3ae7bd",
            timeFieldName:"timestamp",
            fields:"[{\"name\":\"type\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":false},{\"name\":\"gameplayId\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":false},{\"name\":\"ext.extension.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"type_hashCode\",\"type\":\"number\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"ext.dt\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":false},{\"name\":\"ext.checkExt\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":false},{\"name\":\"score\",\"type\":\"number\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"response.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"ext.gameplay\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":false},{\"name\":\"ext.extension2.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"type.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"ext.ayuda\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":false},{\"name\":\"event_hashCode\",\"type\":\"number\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"ext.ayuda.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"ext.mobile\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":true,\"doc_values\":false},{\"name\":\"target.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true},{\"name\":\"name.keyword\",\"type\":\"string\",\"count\":0,\"scripted\":false,\"indexed\":true,\"analyzed\":false,\"doc_values\":true}]"
        }
    }
];

module.exports = traces;


