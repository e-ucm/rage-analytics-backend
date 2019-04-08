define({ "api": [
  {
    "type": "get",
    "url": "/classes/:classId/sessions/my Returns all the Activities of a given",
    "title": "class where the user participates.",
    "name": "GetActivities",
    "group": "Activities",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-gleaner-user.",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "classId",
            "description": "<p>The Class id of the activity.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n        \"_id\": \"559a447831b76cec185bf501\"\n        \"gameId\": \"559a447831b76cec185bf513\",\n        \"versionId\": \"559a447831b76cec185bf514\",\n        \"classId\": \"559a447831b76cec185bf542\",\n        \"start\": \"2015-07-06T09:00:52.630Z\",\n        \"end\": \"2015-07-06T09:03:45.631Z\"\n    },\n    {\n        \"_id\": \"559a447831b76cec185bf511\"\n        \"gameId\": \"559a447831b76cec185bf513\",\n        \"versionId\": \"559a447831b76cec185bf514\",\n        \"classId\": \"559a447831b76cec185bf546\",\n        \"start\": \"2015-07-06T09:03:52.636Z\"\n    }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/classes.js",
    "groupTitle": "Activities"
  },
  {
    "type": "get",
    "url": "/activities",
    "title": "Returns the Activities.",
    "name": "GetActivities",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The Activity id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"name\": \"Some Activity Name\",\n    \"gameId\": \"559a447831b76cec185bf513\",\n    \"versionId\": \"559a447831b76cec185bf514\",\n    \"classId\": \"559a447831b76cec185bf515\",\n    \"rootId\": \"\",\n    \"offline\": false,\n    \"created\": \"2015-07-06T09:00:50.630Z\",\n    \"start\": \"2015-07-06T09:00:52.630Z\",\n    \"end\": \"2015-07-06T09:03:45.631Z\",\n    \"open\": false,\n    \"visible\": false\n    \"allowAnonymous\": false,\n    \"groups\": [],\n    \"groupings\": [],\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "get",
    "url": "/games/:gameId/versions/:versionsId/activities/my Returns all the Activities of a given",
    "title": "version of a game where the user participates.",
    "name": "GetActivities",
    "group": "Activities",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-gleaner-user.",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>The Game id of the activity.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "versionId",
            "description": "<p>The Version id of the activity.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n        \"_id\": \"559a447831b76cec185bf501\"\n        \"gameId\": \"559a447831b76cec185bf513\",\n        \"versionId\": \"559a447831b76cec185bf514\",\n        \"classId\": \"559a447831b76cec185bf542\",\n        \"start\": \"2015-07-06T09:00:52.630Z\",\n        \"end\": \"2015-07-06T09:03:45.631Z\"\n    },\n    {\n        \"_id\": \"559a447831b76cec185bf511\"\n        \"gameId\": \"559a447831b76cec185bf513\",\n        \"versionId\": \"559a447831b76cec185bf514\",\n        \"classId\": \"559a447831b76cec185bf546\",\n        \"start\": \"2015-07-06T09:03:52.636Z\"\n    }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Activities"
  },
  {
    "type": "get",
    "url": "/games/:gameId/versions/:versionsId/activities Returns all the Activities of a",
    "title": "given version of a game.",
    "name": "GetActivities",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>The Game id of the activity.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "versionId",
            "description": "<p>The Version id of the activity.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n        \"_id\": \"559a447831b76cec185bf501\"\n        \"gameId\": \"559a447831b76cec185bf513\",\n        \"versionId\": \"559a447831b76cec185bf514\",\n        \"classId\": \"559a447831b76cec185bf542\",\n        \"created\": \"2015-07-06T09:00:50.630Z\",\n        \"start\": \"2015-07-06T09:00:52.630Z\",\n        \"end\": \"2015-07-06T09:03:45.631Z\"\n    },\n    {\n        \"_id\": \"559a447831b76cec185bf511\"\n        \"gameId\": \"559a447831b76cec185bf513\",\n        \"versionId\": \"559a447831b76cec185bf514\",\n        \"classId\": \"559a447831b76cec185bf547\",\n        \"created\": \"2015-07-06T09:00:50.630Z\",\n        \"start\": \"2015-07-06T09:03:52.636Z\",\n        \"end\": \"2015-07-06T09:03:58.631Z\"\n    }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Activities"
  },
  {
    "type": "get",
    "url": "/activities/my",
    "title": "Returns the Activities where the user participates.",
    "name": "GetActivities",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The Activity id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"name\": \"Some Activity Name\",\n    \"gameId\": \"559a447831b76cec185bf513\",\n    \"versionId\": \"559a447831b76cec185bf514\",\n    \"classId\": \"559a447831b76cec185bf515\",\n    \"rootId\": \"\",\n    \"offline\": false,\n    \"created\": \"2015-07-06T09:00:50.630Z\",\n    \"start\": \"2015-07-06T09:00:52.630Z\",\n    \"end\": \"2015-07-06T09:03:45.631Z\",\n    \"open\": false,\n    \"visible\": false\n    \"allowAnonymous\": false,\n    \"groups\": [],\n    \"groupings\": [],\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "get",
    "url": "/activities/:activityId",
    "title": "Returns the Activity that has the given id.",
    "name": "GetActivities",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "activityId",
            "description": "<p>The Activity id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"name\": \"Some Activity Name\",\n    \"gameId\": \"559a447831b76cec185bf513\",\n    \"versionId\": \"559a447831b76cec185bf514\",\n    \"classId\": \"559a447831b76cec185bf515\",\n    \"rootId\": \"\",\n    \"offline\": false,\n    \"created\": \"2015-07-06T09:00:50.630Z\",\n    \"start\": \"2015-07-06T09:00:52.630Z\",\n    \"end\": \"2015-07-06T09:03:45.631Z\",\n    \"open\": false,\n    \"visible\": false\n    \"allowAnonymous\": false,\n    \"groups\": [],\n    \"groupings\": [],\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "get",
    "url": "/classes/:classId/activities Returns all the Activities of a",
    "title": "class.",
    "name": "GetActivities",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "classId",
            "description": "<p>The Class id of the activity.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n        \"_id\": \"559a447831b76cec185bf501\"\n        \"gameId\": \"559a447831b76cec185bf513\",\n        \"versionId\": \"559a447831b76cec185bf514\",\n        \"classId\": \"559a447831b76cec185bf542\",\n        \"created\": \"2015-07-06T09:00:50.630Z\",\n        \"start\": \"2015-07-06T09:00:52.630Z\",\n        \"end\": \"2015-07-06T09:03:45.631Z\"\n    },\n    {\n        \"_id\": \"559a447831b76cec185bf511\"\n        \"gameId\": \"559a447831b76cec185bf513\",\n        \"versionId\": \"559a447831b76cec185bf514\",\n        \"classId\": \"559a447831b76cec185bf547\",\n        \"created\": \"2015-07-06T09:00:50.630Z\",\n        \"start\": \"2015-07-06T09:03:52.636Z\",\n        \"end\": \"2015-07-06T09:03:58.631Z\"\n    }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/classes.js",
    "groupTitle": "Activities"
  },
  {
    "type": "get",
    "url": "/activities/:activityId/results",
    "title": "Returns all the results of a activity given a DSL query (body).",
    "name": "GetActivityResults",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "activityId",
            "description": "<p>The activity id.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n   {\n       \"selected\": {\n         \"menu\": {\n           \"Inicio\": 1\n         }\n       },\n       \"progressed\": {\n         \"serious-game\": {\n           \"EscenaIncio\": 1\n         }\n       },\n       \"accessed\": {\n         \"screen\": {\n           \"Creditos\": 1\n         }\n       },\n       \"initialized\": {\n         \"serious-game\": {\n           \"EscenaIncio\": 1\n         }\n       }\n     }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "post",
    "url": "/activities Creates new Activity for a",
    "title": "class in a given version of a game.",
    "name": "PostActivity",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>The name for the Activity.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>The Game id of the session.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "versionId",
            "description": "<p>The Version id of the session.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "classId",
            "description": "<p>The Class id of the session.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"name\": \"New name\",\n    \"gameId\": \"55e433c773415f105025d2d4\",\n    \"versionId\": \"55e433c773415f105025d2d5\",\n    \"classId\": \"55e433c773415f105025d2d3\",\n    \"offline\": false\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"5bdc46009b12ed8295ab13d0\",\n    \"name\": \"New name\",\n    \"gameId\": \"55e433c773415f105025d2d4\",\n    \"versionId\": \"55e433c773415f105025d2d5\",\n    \"classId\": \"55e433c773415f105025d2d3\",\n    \"rootId\": null,\n    \"offline\": false,\n    \"groups\": [],\n    \"groupings\": [],\n    \"created\": \"2018-11-02T12:41:36.705Z\",\n    \"open\": false,\n    \"visible\": false,\n    \"allowAnonymous\": false,\n    \"trackingCode\": \"5bdc46009b12ed8295ab13d0g4b0dz9znb5\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "post",
    "url": "/activities/bundle/ Creates new Activity for a",
    "title": "class in a given version of a game, including dashboards and visualizations.",
    "name": "PostBundleActivity",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>The name for the Activity.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>The Game id of the session.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "versionId",
            "description": "<p>The Version id of the session.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "classId",
            "description": "<p>The Class id of the session.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"name\": \"New name\",\n    \"gameId\": \"55e433c773415f105025d2d4\",\n    \"versionId\": \"55e433c773415f105025d2d5\",\n    \"classId\": \"55e433c773415f105025d2d3\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"5bdc46009b12ed8295ab13d0\",\n    \"name\": \"New name\",\n    \"gameId\": \"55e433c773415f105025d2d4\",\n    \"versionId\": \"55e433c773415f105025d2d5\",\n    \"classId\": \"55e433c773415f105025d2d3\",\n    \"rootId\": null,\n    \"offline\": false,\n    \"groups\": [],\n    \"groupings\": [],\n    \"created\": \"2018-11-02T12:41:36.705Z\",\n    \"open\": false,\n    \"visible\": false,\n    \"allowAnonymous\": false,\n    \"trackingCode\": \"5bdc46009b12ed8295ab13d0g4b0dz9znb5\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "put",
    "url": "/activities/:activityId/results/:resultId",
    "title": "Updates a specific result from a activity.",
    "name": "PutActivityResults",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "activityId",
            "description": "<p>Game id.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "resultId",
            "description": "<p>The Result id.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"question\": {\"ATNombreManiobra\":2},\n    \"menu\": {\"ResumenAT\":2}\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n       \"accessed\": {\n         \"cutscene\": {\n           \"VideoInciarTos\": 1,\n           \"VideoHeimlich\": 1\n         },\n         \"area\": {\n           \"FinAtragantamiento\": 1\n         }\n       },\n       \"selected\": {\n         \"alternative\": {\n           \"ManosPechoHeimlich\": 1,\n           \"ManosHeimlich\": 1,\n           \"IniciarTos\": 1,\n           \"ColocacionHeimlich\": 1\n         },\n         \"question\": {\n           \"ATNombreManiobra\": 2\n         },\n         \"menu\": {\n           \"ResumenAT\": 2,\n           \"Inicio\": 1\n         }\n       },\n       \"progressed\": {\n         \"level\": {\n           \"Atragantamiento\": 6\n         },\n         \"serious-game\": {\n           \"EscenaIncio\": 1\n         }\n       },\n       \"initialized\": {\n         \"serious-game\": {\n           \"EscenaIncio\": 1\n         },\n         \"level\": {\n           \"Atragantamiento\": 1\n         }\n       },\n       \"completed\": {\n         \"level\": {\n           \"Atragantamiento\": 1\n         }\n       }\n     }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "delete",
    "url": "/activities/:activityId",
    "title": "Deletes a activity and all the results associated with it",
    "name": "deleteActivities",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "activityId",
            "description": "<p>The id of the activity.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Success.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "delete",
    "url": "/activities/data/:activityId",
    "title": "Remove the activity analysis data with the id activityId.",
    "name": "deleteActivities",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "versionId",
            "description": "<p>The versionId The activity id.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "activityId",
            "description": "<p>The activityId The activity id.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "delete",
    "url": "/activities/data/:activityId/:user",
    "title": "Remove the user data from the analysis with analysisId.",
    "name": "deleteActivities",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "activityId",
            "description": "<p>The activity id.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>The user identifier.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "post",
    "url": "/activities/:activityId/event/:event",
    "title": "Starts or ends a activity depending on the event value.",
    "name": "postActivities",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "event",
            "description": "<p>Determines if we should start or end a activity. Allowed values: start, end.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf511\"\n    \"gameId\": \"559a447831b76cec185bf513\",\n    \"versionId\": \"559a447831b76cec185bf514\",\n    \"classId\": \"559a447831b76cec185bf515\",\n    \"name\": \"The Activity Name\",\n    \"created\": \"2015-07-06T09:00:50.630Z\",\n    \"start\": \"2015-07-06T09:01:52.636Z\",\n    \"end\": \"2015-07-06T09:03:45.631Z\",\n    \"name\": \"Some Activity Name\",\n    \"allowAnonymous\": false,\n    \"teachers\": [\"Ben\"],\n    \"students\": [\"Alice\", \"Dan\"]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "post",
    "url": "/activities/:activityId/event/:event",
    "title": "Starts or ends a activity depending on the event value.",
    "name": "postActivities",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "event",
            "description": "<p>Determines if we should start or end a activity. Allowed values: start, end.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"5bdc46009b12ed8295ab13d0\",\n    \"name\": \"My New Name\",\n    \"gameId\": \"55e433c773415f105025d2d4\",\n    \"versionId\": \"55e433c773415f105025d2d5\",\n    \"classId\": \"55e433c773415f105025d2d3\",\n    \"rootId\": null,\n    \"offline\": false,\n    \"groups\": [\"groupID\"],\n    \"groupings\": [\"groupingID\"],\n    \"created\": \"2018-11-02T12:41:36.705Z\",\n    \"open\": false,\n    \"visible\": false,\n    \"allowAnonymous\": true,\n    \"trackingCode\": \"5bdc46009b12ed8295ab13d0g4b0dz9znb5\"\n    \"start\": \"2015-07-06T09:01:52.636Z\",\n    \"end\": \"2015-07-06T09:03:45.631Z\",\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "post",
    "url": "/activities/:activityId/event/:event",
    "title": "Starts or ends a activity depending on the event value.",
    "name": "postActivities",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "event",
            "description": "<p>Determines if we should start or end a activity. Allowed values: start, end.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf511\"\n    \"gameId\": \"559a447831b76cec185bf513\",\n    \"versionId\": \"559a447831b76cec185bf514\",\n    \"classId\": \"559a447831b76cec185bf515\",\n    \"name\": \"The Activity Name\",\n    \"created\": \"2015-07-06T09:00:50.630Z\",\n    \"start\": \"2015-07-06T09:01:52.636Z\",\n    \"end\": \"2015-07-06T09:03:45.631Z\",\n    \"name\": \"Some Activity Name\",\n    \"allowAnonymous\": false,\n    \"teachers\": [\"Ben\"],\n    \"students\": [\"Alice\", \"Dan\"]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "post",
    "url": "/activities/:activityId/event/:event",
    "title": "Starts or ends a activity depending on the event value.",
    "name": "postActivities",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "event",
            "description": "<p>Determines if we should start or end a activity. Allowed values: start, end.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf511\"\n    \"gameId\": \"559a447831b76cec185bf513\",\n    \"versionId\": \"559a447831b76cec185bf514\",\n    \"classId\": \"559a447831b76cec185bf515\",\n    \"name\": \"The Activity Name\",\n    \"created\": \"2015-07-06T09:00:50.630Z\",\n    \"start\": \"2015-07-06T09:01:52.636Z\",\n    \"end\": \"2015-07-06T09:03:45.631Z\",\n    \"name\": \"Some Activity Name\",\n    \"allowAnonymous\": false,\n    \"teachers\": [\"Ben\"],\n    \"students\": [\"Alice\", \"Dan\"]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "post",
    "url": "/activities/test/:versionId",
    "title": "Starts a TEST Kafka Topic and Storm Topology and sends the body data to the Kafka Topic.",
    "name": "postActivitiesTest",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "versionId",
            "description": "<p>Determines the name of the Kafka Topic and Storm Topology. Should be a unique string.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "\n[\n    {\n        \"actor\": {\n            \"objectType\": \"Agent\",\n            \"mbox\": \"mailto:user@example.com\",\n            \"name\": \"Project Tin Can API\"\n        },\n        \"verb\": {\n            \"id\": \"http://adlnet.gov/expapi/verbs/updated\",\n            \"display\": {\n                \"en-US\": \"created\"\n            }\n        },\n        \"object\": {\n            \"id\": \"http://example.adlnet.gov/xapi/example/testVar\",\n            \"definition\": {\n                \"name\": {\n                    \"en-US\": \"simple statement\"\n                },\n                \"description\": {\n                    \"en-US\": \"A simple Experience API statement.\"\n                }\n            }\n        },\n        \"result\": {\n            \"extensions\": {\n                \"value\": \"randomVariableValue\"\n            }\n        }\n    },\n    {\n        \"timestamp\": \"2016-01-22T14:11:22.798Z\",\n        \"actor\": {\n            \"name\": \"56a2388d20b8364200f67d9c67412\",\n            \"account\": {\n                \"homePage\": \"http://a2:3000/\",\n                \"name\": \"Anonymous\"\n            }\n        },\n        \"verb\": {\n            \"id\": \"http://purl.org/xapi/games/verbs/entered\"\n        },\n        \"object\": {\n            \"id\": \"http://a2:3000/api/proxy/gleaner/games/56a21ac020b8364200f67d84/56a21ac020b8364200f67d85/zone/TestZone\",\n            \"definition\": {\n                \"extensions\": {\n                    \"versionId\": \"testVersionId\",\n                    \"gameplayId\": \"100000000000000000000000\"\n                }\n            }\n        },\n        \"result\": {\n            \"extensions\": {\n                \"http://purl.org/xapi/games/ext/value\": \"\"\n            }\n        }\n    },\n    {\n        \"timestamp\": \"2016-01-22T14:11:22.796Z\",\n        \"actor\": {\n            \"name\": \"56a2388d20b8364200f67d9c67412\",\n            \"account\": {\n                \"homePage\": \"http://a2:3000/\",\n                \"name\": \"Anonymous\"\n            }\n        },\n        \"verb\": {\n            \"id\": \"http://purl.org/xapi/games/verbs/viewed\"\n        },\n        \"object\": {\n            \"id\": \"http://a2:3000/api/proxy/gleaner/games/56a21ac020b8364200f67d84/56a21ac020b8364200f67d85/screen/MainMenu\",\n            \"definition\": {\n                \"extensions\": {\n                    \"versionId\": \"testVersionId\",\n                    \"gameplayId\": \"100000000000000000000000\"\n                }\n            }\n        },\n        \"result\": {\n            \"extensions\": {\n                \"http://purl.org/xapi/games/ext/value\": \"\"\n            }\n        }\n    },\n    {\n        \"timestamp\": \"2016-01-22T14:33:34.352Z\",\n        \"actor\": {\n            \"name\": \"56a23d8420b8364200f67d9f79692\",\n            \"account\": {\n                \"homePage\": \"http://a2:3000/\",\n                \"name\": \"Anonymous\"\n            }\n        },\n        \"verb\": {\n            \"id\": \"http://purl.org/xapi/games/verbs/choose\"\n        },\n        \"object\": {\n            \"id\": \"http://a2:3000/api/proxy/gleaner/games/56a21ac020b8364200f67d84/56a21ac020b8364200f67d85/choice/PickSwordItem\",\n            \"definition\": {\n                \"extensions\": {\n                    \"versionId\": \"testVersionId\",\n                    \"gameplayId\": \"100000000000000000000000\"\n                }\n            }\n        },\n        \"result\": {\n            \"extensions\": {\n                \"http://purl.org/xapi/games/ext/value\": \"Excalibur Mk. II\"\n            }\n        }\n    },\n    {\n        \"timestamp\": \"2016-01-22T14:33:34.346Z\",\n        \"actor\": {\n            \"name\": \"56a23d8420b8364200f67d9f79692\",\n            \"account\": {\n                \"homePage\": \"http://a2:3000/\",\n                \"name\": \"Anonymous\"\n            }\n        },\n        \"verb\": {\n            \"id\": \"http://purl.org/xapi/games/verbs/updated\"\n        },\n        \"object\": {\n            \"id\": \"http://a2:3000/api/proxy/gleaner/games/56a21ac020b8364200f67d84/56a21ac020b8364200f67d85/variable/AvailableCoins\",\n            \"definition\": {\n                \"extensions\": {\n                    \"versionId\": \"testVersionId\",\n                    \"gameplayId\": \"100000000000000000000000\"\n                }\n            }\n        },\n        \"result\": {\n            \"extensions\": {\n                \"http://purl.org/xapi/games/ext/value\": \"30\"\n            }\n        }\n    }\n]",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"message\": \"Success \",\n    \"id\": \"test-<versionId>\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "put",
    "url": "/activities/:activityId",
    "title": "Changes the name, students and/or teachers array of a activity.",
    "name": "putActivities",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "activityId",
            "description": "<p>The id of the activity.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>The new name of the activity</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "allowAnonymous",
            "description": "<p>Whether this activity should process data from anonymous users or not.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "groups",
            "description": "<p>Array with the groups Ids of the groups that you want to add to the activity. Also can be a String.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "groupings",
            "description": "<p>Array with the groupings Ids of the groupings that you want to add to the activity. Also can be a String</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"name\": \"My New Name\",\n    \"allowAnonymous\": true,\n    \"groups\": [\"groupID\"],\n    \"groupings\": [\"groupingID\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"5bdc46009b12ed8295ab13d0\",\n    \"name\": \"My New Name\",\n    \"gameId\": \"55e433c773415f105025d2d4\",\n    \"versionId\": \"55e433c773415f105025d2d5\",\n    \"classId\": \"55e433c773415f105025d2d3\",\n    \"rootId\": null,\n    \"offline\": false,\n    \"groups\": [\"groupID\"],\n    \"groupings\": [\"groupingID\"],\n    \"created\": \"2018-11-02T12:41:36.705Z\",\n    \"open\": false,\n    \"visible\": false,\n    \"allowAnonymous\": true,\n    \"trackingCode\": \"5bdc46009b12ed8295ab13d0g4b0dz9znb5\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "put",
    "url": "/activities/:activityId/remove",
    "title": "Removes students and/or teachers from a activity.",
    "name": "putActivities",
    "group": "Activities",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "activityId",
            "description": "<p>The id of the activity.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "groups",
            "description": "<p>Array with the groups Ids of the groups that you want to add to the activity. Also can be a String.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "groupings",
            "description": "<p>Array with the groupings Ids of the groupings that you want to add to the activity. Also can be a String</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"groups\": [\"groupID\"],\n    \"groupings\": [\"groupingID\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"5bdc46009b12ed8295ab13d0\",\n    \"name\": \"My New Name\",\n    \"gameId\": \"55e433c773415f105025d2d4\",\n    \"versionId\": \"55e433c773415f105025d2d5\",\n    \"classId\": \"55e433c773415f105025d2d3\",\n    \"rootId\": null,\n    \"offline\": false,\n    \"groups\": [],\n    \"groupings\": [],\n    \"created\": \"2018-11-02T12:41:36.705Z\",\n    \"open\": false,\n    \"visible\": false,\n    \"allowAnonymous\": true,\n    \"trackingCode\": \"5bdc46009b12ed8295ab13d0g4b0dz9znb5\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/activities.js",
    "groupTitle": "Activities"
  },
  {
    "type": "delete",
    "url": "/analysis/:versionId",
    "title": "Deletes the analysis of a given version of a game",
    "name": "DeleteAnalysis",
    "group": "Analysis",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "versionId",
            "description": "<p>The id of the version of te game.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Success.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/analysis.js",
    "groupTitle": "Analysis"
  },
  {
    "type": "get",
    "url": "/api/analysis/:id",
    "title": "Returns the Analysis that has the given id.",
    "name": "GetAnalysis",
    "group": "Analysis",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The Version id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"realtimePath\": \"/analysis/559a447831b76cec185bf514/realtime.jar\",\n    \"fluxPath\": \"/analysis/559a447831b76cec185bf514/flux.yml\",\n    \"created\": \"2015-07-06T09:00:50.630Z\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/analysis.js",
    "groupTitle": "Analysis"
  },
  {
    "type": "post",
    "url": "/analysis/:versionId/",
    "title": "Adds a new Analysis for a given versionId",
    "name": "PostAnalysis",
    "group": "Analysis",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "versionId",
            "description": "<p>The id of the version of the game.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "{} Request-Example:",
          "content": "A zip file with a 'realtime.jar' (analysis) and 'flux.yml' (configuration) files, e.g.:\nanalysis.zip -> /\n\n            realtime.jar    // A jar file with the analysis topology in a correct Storm & Flux format.\n            flux.yml        // A configuration file for the analysis. More info. about the Storm-Flux\n                            // specification: https://github.com/apache/storm/blob/master/external/flux/README.md",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"realtimePath\": \"/analysis/559a447831b76cec185bf514/realtime.jar\",\n    \"fluxPath\": \"/analysis/559a447831b76cec185bf514/flux.yml\",\n    \"created\": \"2015-07-06T09:00:50.630Z\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/analysis.js",
    "groupTitle": "Analysis"
  },
  {
    "type": "delete",
    "url": "/classes/:classId",
    "title": "Deletes a class and all the sessions associated with it",
    "name": "DeleteClasses",
    "group": "Classes",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "classId",
            "description": "<p>The id of the session.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Success.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/classes.js",
    "groupTitle": "Classes"
  },
  {
    "type": "get",
    "url": "/classes",
    "title": "Returns all the classes.",
    "name": "GetClasses",
    "group": "Classes",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n        \"_id\": \"559a447831b7acec185bf513\",\n        \"created\": \"2015-08-31T12:55:05.459Z\",\n        \"name\": \"My Class\",\n        \"courseId\": \"5429l3v2jkfe20acec83tbf98s\",\n        \"groups\": [\"group1\", \"group2\"],\n        \"groupings\": [\"grouping1\"],\n        \"participants\":{\n            \"students\": [\"st1\", \"st2\"],\n            \"assistants\": [\"as1\", \"as2\"],\n            \"teachers\": [\"teacher\"]\n        }\n    }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/classes.js",
    "groupTitle": "Classes"
  },
  {
    "type": "get",
    "url": "/classes/my Returns all the Classes where",
    "title": "the user participates.",
    "name": "GetClasses",
    "group": "Classes",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-gleaner-user.",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n        \"_id\": \"559a447831b76cec185bf501\",\n        \"created\": \"2015-08-31T12:55:05.459Z\",\n        \"name\": 'first class',\n        \"courseId\": \"5429l3v2jkfe20acec83tbf98s\",\n        \"groups\": [\"group1\", \"group2\"],\n        \"groupings\": [\"grouping1\"],\n        \"participants\":{\n            \"students\": [\"st1\", \"st2\"],\n            \"assistants\": [\"as1\", \"as2\"],\n            \"teachers\": [\"teacher\"]\n        },\n        \"externalId\":[\n            { \"domain\": \"d1\", \"id\": \"1\" },\n            { \"domain\": \"d2\", \"id\": \"2\" }\n        ]\n    },\n    {\n        \"_id\": \"559a447831b76cec185bf511\",\n        \"created\": \"2015-08-31T12:55:05.459Z\",\n        \"name\": 'second class',\n        \"courseId\": \"5429l3v2jkfe20acec83tbf98s\",\n        \"participants\":{\n            \"students\": [\"st1\", \"st2\", \"st3\"],\n            \"assistants\": [\"as2\"],\n            \"teachers\": [\"teacher2\"]\n        },\n        \"externalId\":[\n            { \"domain\": \"d1\", \"id\": \"4\" }\n        ]\n    }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/classes.js",
    "groupTitle": "Classes"
  },
  {
    "type": "get",
    "url": "/classes/:classId",
    "title": "Returns a given class.",
    "name": "GetClasses",
    "group": "Classes",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"created\": \"2015-08-31T12:55:05.459Z\",\n    \"name\": \"Some Class Name\",\n    \"courseId\": \"5429l3v2jkfe20acec83tbf98s\",\n    \"groups\": [\"group1\", \"group2\"],\n    \"groupings\": [\"grouping1\"],\n    \"participants\":{\n        \"students\": [\"st1\", \"st2\"],\n        \"assistants\": [\"as1\", \"as2\"],\n        \"teachers\": [\"teacher\"]\n    },\n    \"externalId\":[\n        { \"domain\": \"d1\", \"id\": \"1\" },\n        { \"domain\": \"d2\", \"id\": \"2\" }\n    ]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/classes.js",
    "groupTitle": "Classes"
  },
  {
    "type": "post",
    "url": "/classes/bundle/",
    "title": "Creates new Class.",
    "name": "PostBundleClass",
    "group": "Classes",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>The name of the class.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": true,
            "field": "participants",
            "description": "<p>The students, assistants and students in the class</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "courseId",
            "description": "<p>The id of the course that contains the class</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "groups",
            "description": "<p>Group Id of the group with the participants of the class</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "groupings",
            "description": "<p>Grouping Id of the grouping with the participants of the class</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"name\": \"New name\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"name\": \"New name\",\n    \"created\": \"2015-08-31T12:55:05.459Z\",\n    \"participants\":{\n        \"students\": [\"st1\", \"st2\"],\n        \"assistants\": [\"as1\", \"as2\"],\n        \"teachers\": [\"teacher\"]\n    },\n    \"_id\": \"55e44ea9f1448e1067e64d6c\",\n    \"groups\": [],\n    \"groupings\": [],\n    \"externalId\": []\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/classes.js",
    "groupTitle": "Classes"
  },
  {
    "type": "post",
    "url": "/classes",
    "title": "Creates new Class.",
    "name": "PostClasses",
    "group": "Classes",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>The name of the class.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": true,
            "field": "participants",
            "description": "<p>The students, assistants and students in the class</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "courseId",
            "description": "<p>The id of the course that contains the class</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "groups",
            "description": "<p>Group Id of the group with the participants of the class</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "groupings",
            "description": "<p>Grouping Id of the grouping with the participants of the class</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"name\": \"New name\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"name\": \"New name\",\n    \"created\": \"2015-08-31T12:55:05.459Z\",\n    \"participants\":{\n        \"students\": [\"st1\", \"st2\"],\n        \"assistants\": [\"as1\", \"as2\"],\n        \"teachers\": [\"teacher\"]\n    },\n    \"_id\": \"55e44ea9f1448e1067e64d6c\",\n    \"groups\": [],\n    \"groupings\": [],\n    \"externalId\": []\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/classes.js",
    "groupTitle": "Classes"
  },
  {
    "type": "put",
    "url": "/classes/:classId/remove",
    "title": "Removes students and/or teachers from a class.",
    "name": "PutClasses",
    "group": "Classes",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "classId",
            "description": "<p>The id of the class.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "students",
            "description": "<p>Array with the username of the students that you want to remove from the session. Also can be a String</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "teachers",
            "description": "<p>Array with the username of the teachers that you want to remove from the session. Also can be a String</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"teachers\": [\"Some Teacher\"],\n    \"students\": [\"Some Student\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf511\",\n    \"name\": \"My Class Name\",\n    \"authors\": [\"someTeacher\"],\n    \"teachers\": [\"someTeacher\"],\n    \"students\": []\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/classes.js",
    "groupTitle": "Classes"
  },
  {
    "type": "put",
    "url": "/classes/:classId",
    "title": "Changes the name and participants of a class.",
    "name": "PutClasses",
    "group": "Classes",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "sessionId",
            "description": "<p>The id of the session.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>The new name of the session</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": true,
            "field": "participants",
            "description": "<p>Object with the participants</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "groups",
            "description": "<p>Group ids with of the participants</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "groupings",
            "description": "<p>Grouping ids with of the participants</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"name\": \"My New Name\",\n    \"participants\":{\n        \"students\": [\"st1\", \"st2\"],\n        \"assistants\": [\"as1\", \"as2\"],\n        \"teachers\": [\"teacher2\"]\n    },\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf511\"\n    \"created\": \"2015-07-06T09:00:50.630Z\",\n    \"name\": \"My New Name\",\n    \"participants\":{\n        \"students\": [\"st1\", \"st2\"],\n        \"assistants\": [\"as1\", \"as2\"],\n        \"teachers\": [\"teacher\", \"teacher2\"]\n    },\n    groups: [],\n    groupings: [],\n    externalId: []\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/classes.js",
    "groupTitle": "Classes"
  },
  {
    "type": "post",
    "url": "/collector/start/:trackingCode",
    "title": "Start a tracking session for a client",
    "description": "<p>This method expects either an 'Authorization' header, a body with anonymous player id, or both empty for creating a new anonymous player. 1.- Anonymous users: 1.1.- New anonymous user: empty authorization header and empty body. 1.2.- Existing anonymous user: empty authorization header but body must be: { &quot;anonymous&quot; : &quot;player_id&quot; }. Remember to include &lt;Content-Type, application/json&gt; header. 2.- Authenticated user: header must be: &lt;Authorization, 'Bearer JWT'&gt;, The 'JSON Web Token (JWT) is the 'token' received when logging in as an identified user in the Authorization &amp; Authentication (A2) service: http://e-ucm.github.io/a2/#api-Login-LoginNote that if the value of the 'Authorization' header is the 'JSON Web Token' received when logging into the Authorization &amp; Authentication system (A2) the 'actor' field of the response will have the player name field value set to the authenticated user.</p>",
    "name": "postCollectorStart",
    "group": "Collector",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": true,
            "field": "Authorization",
            "description": "<p>Authorization value. Format: &quot;Bearer JWT&quot;.</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "trackingCode",
            "description": "<p>The tracking code assigned to a given game.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "anonymous",
            "description": "<p>The PlayerId of the anonymous player.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{ \"anonymous\": \"player_id\" }",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    authToken: <String>,             - Used as 'Authorization' header for '/api/collector/track' requests.\n                                       [/api/login, more info. at: http://e-ucm.github.io/a2/#api-Login-Login]\n    actor: Object,                   - For sending xAPI traces, see https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#actor\n    playerAnimalName: <String>,      - Anonymous player name,\n    playerId: <String>,              - Player identifier (useful for anonymous users),\n    objectId: <String>,              - Links to the game url, required by xAPI statements,\n    session: <Int>,                  - Counter of sessions playeds\n    firstSessionStarted: <String>,   - First session date and time formated using ISO 8601\n    currentSessionStarted: <String>  - Current session date and time formated using ISO 8601\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "InvalidTrackingCode",
            "description": "<p>The 'trackingCode' is not valid.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "PlayerNotFound",
            "description": "<p>The player couldn't be created or couldn't be found.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "message",
            "description": "<p>Bearer is non JWT compilant orthe anonymous playerid is not valid or not found.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/collector.js",
    "groupTitle": "Collector"
  },
  {
    "type": "post",
    "url": "/collector/end",
    "title": "Ends the current authorization.",
    "description": "<p>Note that this method expects an 'Authorization' header with the following format &lt;Authorization, 'authToken'&gt;. The 'authToken' can be obtained by issuing a request to '/api/collector/start/:trackingCode' or by re-using a previous active authToken obtained from attempt list.</p>",
    "name": "postCollectorTrack",
    "group": "Collector",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Authorization token obtained on start. Format: &quot;authToken&quot;.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Success.\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "BadRequest",
            "description": "<p>The statement must be an array. Example: [{trace1},{trace2}].</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotValidSession",
            "description": "<p>No active session can fit this user.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/collector.js",
    "groupTitle": "Collector"
  },
  {
    "type": "post",
    "url": "/collector/track",
    "title": "Tracks data from the request body.",
    "description": "<p>Note that this method expects an 'Authorization' header with the following format &lt;Authorization, 'authToken'&gt;. The 'authToken' can be obtained by issuing a request to '/api/collector/start/:trackingCode'.</p>",
    "name": "postCollectorTrack",
    "group": "Collector",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Authorization token obtained on start. Format: &quot;authToken&quot;.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Success.\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "BadRequest",
            "description": "<p>The statement must be an array. Example: [{trace1},{trace2}].</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "NotValidSession",
            "description": "<p>No active session can fit this user.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/collector.js",
    "groupTitle": "Collector"
  },
  {
    "type": "delete",
    "url": "/courses/:id",
    "title": "Deletes a course",
    "name": "DeleteCourse",
    "group": "Course",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The id of the course.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Success.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/courses.js",
    "groupTitle": "Course"
  },
  {
    "type": "put",
    "url": "/classes/groups/:id/remove",
    "title": "Removes participants from a group.",
    "name": "PutCourse",
    "group": "Course",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The id of the course.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "participants.teachers",
            "description": "<p>Array with the username of the teachers that you want to remove from the group.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "participants.assistants",
            "description": "<p>Array with the username of the assistants that you want to remove from the group.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "participants.students",
            "description": "<p>Array with the username of the students that you want to remove from the group.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"teachers\": [\"Teacher1\"],\n    \"assistants\": [\"Assistant1\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf511\",\n    \"title\": \"My Course\",\n    \"teachers\": [Teacher],\n    \"assistants\": [\"Some Assistant\"],\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/groups.js",
    "groupTitle": "Course"
  },
  {
    "type": "put",
    "url": "/courses/:id/remove",
    "title": "Removes teachers and/or assistants from a class.",
    "name": "PutCourse",
    "group": "Course",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The id of the course.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "teachers",
            "description": "<p>Array with the username of the teachers that you want to remove from the course.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "assistants",
            "description": "<p>Array with the username of the assistants that you want to remove from the course.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"teachers\": [\"Some Teacher\"],\n    \"assistants\": [\"Some Assistant\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf511\",\n    \"title\": \"My Course\",\n    \"teachers\": [\"Some Teacher\"],\n    \"assistants\": [\"Some Assistant\"],\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/courses.js",
    "groupTitle": "Course"
  },
  {
    "type": "get",
    "url": "/classes/groups/:id",
    "title": "Returns a given group.",
    "name": "GetCourses",
    "group": "Courses",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"name\": \"Group\",\n    \"classId\": \"559a447831b76cec185bf501\",\n    \"participants\": {\n        \"assistants\": [\"Assistant\"]\n        \"teachers\": [\"Teacher\"]\n        \"students\": [\"Student1\", \"Student2\"]\n     }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/groups.js",
    "groupTitle": "Courses"
  },
  {
    "type": "get",
    "url": "/courses",
    "title": "Return a list of the current courses",
    "name": "GetCourses",
    "group": "Courses",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"title\": \"Course1\",\n    \"teachers\": [\"Teacher\"],\n     \"assistants\": [\"Assistants\"]\n}, {\n    \"_id\": \"559a447831b76cec185bf556\",\n    \"title\": \"Course2\",\n    \"teachers\": [\"Teacher\"]\n}]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/courses.js",
    "groupTitle": "Courses"
  },
  {
    "type": "get",
    "url": "/courses/:id",
    "title": "Returns a given course.",
    "name": "GetCourses",
    "group": "Courses",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"title\": \"Course1\",\n    \"teachers\": [\"Teacher\"],\n    \"assistants\": [\"Assistants\"]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/courses.js",
    "groupTitle": "Courses"
  },
  {
    "type": "post",
    "url": "/courses",
    "title": "Creates new Course.",
    "name": "PostCourses",
    "group": "Courses",
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"title\": \"New course\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"title\": \"New course\",\n    \"teachers\": [\"Teacher\"],\n    \"assistants\": [],\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/courses.js",
    "groupTitle": "Courses"
  },
  {
    "type": "put",
    "url": "/classes/groups/:id",
    "title": "Changes the name of a group and the participants.",
    "name": "PutCourses",
    "group": "Courses",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The id of the course.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>The new name for the group</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "participants.teachers",
            "description": "<p>Array with the username of the teachers that you want add to the group.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "participants.assistants",
            "description": "<p>Array with the username of the assistants that you want add to from the group.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "participants.students",
            "description": "<p>Array with the username of the students that you want add to group.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"name\": \"New Name\",\n    \"participants\": {\n        \"teachers\": [\"Teacher23\"]\n    }\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf511\",\n    \"name\": \"New Name\",\n    \"classId\": \"559a447831b76cec185bf501\",\n    \"participants\": {\n        \"assistants\": [\"Assistant1\"]\n        \"teachers\": [\"Teacher1\", \"Teacher23\"]\n        \"students\": [\"Student1\", \"Student2\", \"Student3\"]\n    }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/groups.js",
    "groupTitle": "Courses"
  },
  {
    "type": "put",
    "url": "/courses/:id",
    "title": "Changes the title of a course and the assistants and teachers.",
    "name": "PutCourses",
    "group": "Courses",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The id of the course.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "title",
            "description": "<p>The new title of the course</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "teachers",
            "description": "<p>Array with the username of the teachers that you want to remove from the course.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "assistants",
            "description": "<p>Array with the username of the assistants that you want to remove from the course.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"title\": \"New Title\",\n    \"teachers\": [\"Some Teacher\"],\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf511\",\n    \"title\": \"New Title\",\n    \"teachers\": [\"Some Teacher\"],\n    \"assistants\": [],\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/courses.js",
    "groupTitle": "Courses"
  },
  {
    "type": "get",
    "url": "/env",
    "title": "Return environment config.",
    "name": "getEnv",
    "group": "Env",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "  HTTP/1.1 200 OK\n[\n  {\n      \"useLrs\": true\n  }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/env.js",
    "groupTitle": "Env"
  },
  {
    "type": "get",
    "url": "/api/kibana/visualization/list/:usr/:id",
    "title": "Return the list of visualizations used in a game with the id.",
    "name": "GetVisualizationList",
    "group": "GameVisualization",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The game id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "usr",
            "description": "<p>The role of the user (dev, tch or all)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n    [\n        \"56962ebf5d817ba040bdca5f\",\n        \"56962eb123d17ba040bdca5f\"\n    ]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "GameVisualization"
  },
  {
    "type": "get",
    "url": "/api/kibana/tuples/fields/game/:id",
    "title": "Return the values that use a game for the visualizations",
    "name": "GetVisualizationValues",
    "group": "GameVisualization",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The game id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"date\": \"time_field\",\n    \"score\": \"score_var\",\n    \"progress\": \"percentage\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "GameVisualization"
  },
  {
    "type": "post",
    "url": "/api/kibana/visualization/game/:gameId/:id",
    "title": "Adds a new visualization with the index fields of game gameId.",
    "name": "PostVisualization",
    "group": "GameVisualization",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>The game id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_index\": \".games\",\n    \"_type\": \"visualization\",\n    \"_id\": \"testing\",\n    \"_version\": 1,\n    \"_shards\": {\n        \"total\": 2,\n        \"successful\": 1,\n        \"failed\": 0\n    },\n    \"created\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "GameVisualization"
  },
  {
    "type": "post",
    "url": "/api/kibana/visualization/list/:id",
    "title": "Add the list of visualizations used in a game.",
    "name": "PostVisualizationList",
    "group": "GameVisualization",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The game id</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n       \"visualizationsTch\": [\n         \"SessionActivityOverTime\",\n         \"PlayersActivity\",\n         \"DifferentAlternativesPreferred\",\n         \"TotalSessionPlayers\",\n         \"AlternativesResponsesCount\",\n         \"xAPIVerbsActivity\",\n         \"AlternativesCountPerPlayer\",\n       ],\n       \"visualizationsDev\": [\n         \"SessionActivityOverTime\",\n         \"TotalSessionPlayers\",\n         \"ActivityCountPerPlayer\",\n         \"AlternativesResponsesCount\",\n         \"PlayersActivityOverTime\"\n       ]\n\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_index\": \".games123\",\n    \"_type\": \"list\",\n    \"_id\": \"123\",\n    \"_version\": 1,\n    \"_shards\": {\n        \"total\": 2,\n        \"successful\": 1,\n        \"failed\": 0\n    },\n    \"created\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "GameVisualization"
  },
  {
    "type": "post",
    "url": "/api/kibana/tuples/fields/game/:id",
    "title": "Add the values that use a game for the visualizations",
    "name": "PostVisualizationValues",
    "group": "GameVisualization",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The visualization id</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"date\": \"time_field\",\n    \"score\": \"score_var\",\n    \"progress\": \"percentage\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_index\": \".games123\",\n    \"_type\": \"fields\",\n    \"_id\": \"fields123\",\n    \"_version\": 1,\n    \"_shards\": {\n        \"total\": 2,\n        \"successful\": 1,\n        \"failed\": 0\n    },\n    \"created\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "GameVisualization"
  },
  {
    "type": "delete",
    "url": "/api/kibana/visualization/list/:gameId/:list/:idToRemove",
    "title": "Remove the visualization with idToRemove of the game gameId.",
    "name": "RemoveVisualizationList",
    "group": "GameVisualization",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>The list id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "list",
            "description": "<p>The list</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "idToRemove",
            "description": "<p>The id to remove</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"visualizationsDev\": [\n        \"UserScore_56962ebf5d817ba040bdca5f\"\n    ],\n    \"visualizationsTch\": []\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "GameVisualization"
  },
  {
    "type": "put",
    "url": "/api/kibana/visualization/list/:id",
    "title": "Update the list of visualizations used in a game.",
    "name": "UpdateVisualizationList",
    "group": "GameVisualization",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The game id</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n       \"visualizationsDev\": [\n         \"SessionActivityOverTime\",\n       ]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_index\": \".games\",\n    \"_type\": \"list\",\n    \"_id\": \"visualization_list\",\n    \"_version\": 1,\n    \"_shards\": {\n        \"total\": 2,\n        \"successful\": 1,\n        \"failed\": 0\n    },\n    \"created\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "GameVisualization"
  },
  {
    "type": "delete",
    "url": "/games/:id",
    "title": "Removes the game if doesn't contain activities else change the deleted field by true.",
    "name": "DeleteGame",
    "group": "Games",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Game id.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Success.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "get",
    "url": "/games/:id/xapi/:versionId Returns the game with the given id.",
    "title": "This route is mainly used as the Object.id of the xAPI statements.",
    "name": "GetGame",
    "group": "Games",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b7acec185bf513\",\n    \"title\": \"My Game\"\n    \"authors\": [\"someDeveloper\"],\n    \"developers\": [\"someDeveloper\"],\n    \"public\": \"true\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "get",
    "url": "/games/:gameId",
    "title": "Returns a specific game.",
    "name": "GetGames",
    "group": "Games",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>Game id.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b7acec185bf513\",\n    \"title\": \"My Game\",\n    \"created\": \"2017-07-06T09:00:52.630Z\",\n    \"authors\": [\"someDeveloper\"],\n    \"developers\": [\"someDeveloper\"],\n    \"public\": \"true\",\n    \"deleted\": \"false\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "get",
    "url": "/games/public",
    "title": "Returns all the public games.",
    "name": "GetGames",
    "group": "Games",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n        \"_id\": \"559a447831b7acec185bf513\",\n        \"title\": \"My Game\",\n        \"created\": \"2017-07-06T09:00:52.630Z\",\n        \"authors\": [\"someDeveloper\"],\n        \"developers\": [\"someDeveloper\"],\n        \"public\": \"true\",\n        \"deleted\": \"false\"\n    }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "get",
    "url": "/games/:gameId/versions",
    "title": "Returns all the versions of a given game.",
    "name": "GetVersions",
    "group": "Games",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>Game id.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n        \"_id\": \"559a447831b76cec185bf513\",\n        \"gameId\": \"559a447831b7acec185bf513\"\n    }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "get",
    "url": "/games/:gameId/versions/:id",
    "title": "Returns a version for a specific game.",
    "name": "GetVersions",
    "group": "Games",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>Game id.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Version id.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf513\",\n    \"gameId\": \"559a447831b7acec185bf514\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "post",
    "url": "/game/bundle/",
    "title": "Creates new Game, including a version one, dashboards and visualizations.",
    "name": "PostBundleGame",
    "group": "Games",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>The name for the Game.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"title\": \"New name\",\n    \"public\": false\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"gameId\": \"55e433c773415f105025d2d4\",\n    \"versionId\": \"55e433c773415f105025d2d5\",\n    \"name\": \"New name\",\n    \"created\": \"2015-08-31T12:55:05.459Z\",\n    \"developers\": [\n        \"user\"\n    ],\n    \"_id\": \"55e44ea9f1448e1067e64d6c\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "post",
    "url": "/games",
    "title": "Adds a new game.",
    "name": "PostGames",
    "group": "Games",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-gleaner-user.",
            "description": ""
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "title",
            "description": "<p>The title of the game.</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "public",
            "description": "<p>If other people can see the game.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"title\": \"My Game\",\n    \"public\": \"true\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b7acec185bf513\",\n    \"title\": \"My Game\",\n    \"created\": \"2017-07-06T09:00:52.630Z\",\n    \"authors\": [\"someDeveloper\"],\n    \"developers\": [\"someDeveloper\"],\n    \"public\": \"true\",\n    \"deleted\": \"false\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "post",
    "url": "/games/:gameId/versions",
    "title": "Adds a new version for a specific game.",
    "name": "PostVersions",
    "group": "Games",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>Game id.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf513\",\n    \"gameId\": \"559a447831b7acec185bf513\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "put",
    "url": "/games/:gameId",
    "title": "Changes the title, developers and public attribute of a game.",
    "name": "PutGames",
    "group": "Games",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>The id of the game.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "title",
            "description": "<p>The new title of the game</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "public",
            "description": "<p>Whether the game is public or not.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "developers",
            "description": "<p>Array with the username of the authors that you want to add to the game. Also can be a String</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"title\": \"My New Name\",\n    \"developers\": [\"Some Username\"],\n    \"public\": \"true\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b7acec185bf513\",\n    \"title\": \"My Game\"\n    \"authors\": [\"someDeveloper\"],\n    \"developers\": [\"Some Username\"],\n    \"public\": \"true\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "put",
    "url": "/games/:gameId/remove",
    "title": "Removes an developer of the game",
    "name": "PutGames",
    "group": "Games",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>The id of the game.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "author",
            "description": "<p>Array with the username of the authors that you want to add to the game. Also can be a String</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"developers\": [\"Some Username\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b7acec185bf513\",\n    \"title\": \"My Game\"\n    \"authors\": [\"someDeveloper\"],\n    \"developers\": [],\n    \"public\": \"true\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "post",
    "url": "/games/:gameId/versions/:id",
    "title": "Adds a new name or link for a specific version.",
    "name": "PutVersions",
    "group": "Games",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>Game id.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Version id.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"name\": \"New name\",\n    \"link\": \"New Link\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"name\": \"New name\",\n    \"link\": \"New Link\",\n    \"_id\": \"559a447831b76cec185bf513\",\n    \"gameId\": \"559a447831b7acec185bf513\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Games"
  },
  {
    "type": "delete",
    "url": "/classes/groups/:id",
    "title": "Deletes a group",
    "name": "DeleteGroup",
    "group": "Group",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The id of the group.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Success.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/groups.js",
    "groupTitle": "Group"
  },
  {
    "type": "delete",
    "url": "/classes/grouping/:id",
    "title": "Deletes a group",
    "name": "DeleteGrouping",
    "group": "Grouping",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The id of the grouping.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"message\": \"Success.\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/groupings.js",
    "groupTitle": "Grouping"
  },
  {
    "type": "get",
    "url": "/classes/groupings/:id",
    "title": "Returns a given grouping.",
    "name": "GetGroupings",
    "group": "Groupings",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"name\": \"Grouping1\",\n    \"classId\": \"559a447831b76cec185bf501\",\n    \"teachers\": [\"Teacher1\"]\n    \"groups\": [\"559a447834376cec185bf501\"]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/groupings.js",
    "groupTitle": "Groupings"
  },
  {
    "type": "get",
    "url": "/classes/:id/groupings",
    "title": "Return a list of the current groupings",
    "name": "GetGroupings",
    "group": "Groupings",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"name\": \"Grouping1\",\n    \"classId\": \"559a447831b76cec185bf501\",\n    \"teachers\": [\"Teacher1\"]\n    \"groups\": [\"559a447834376cec185bf501\"]\n}, {\n    \"_id\": \"559a447831b76cec185bf502\",\n    \"name\": \"Group2\",\n    \"classId\": \"559a447831b76cec185bf501\",\n    \"teachers\": [\"Teacher2\"]\n    \"groups\": [\"559a447834376cec185bf501\", \"559a44783176f4sec185bf501\"]\n}]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/groupings.js",
    "groupTitle": "Groupings"
  },
  {
    "type": "post",
    "url": "/classes/:id/groupings",
    "title": "Creates new Grouping.",
    "name": "PostGroupings",
    "group": "Groupings",
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"name\": \"Name\",\n    \"classId\": \"559a447831b76cec185bf501\",\n    \"teachers\": [\"Teacher1\"]\n    \"groups\": [\"559a447834376cec185bf501\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"name\": \"Name\",\n    \"classId\": \"559a447831b76cec185bf501\",\n    \"teachers\": [\"Teacher1\"]\n    \"groups\": [\"559a447834376cec185bf501\"]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/groupings.js",
    "groupTitle": "Groupings"
  },
  {
    "type": "put",
    "url": "/classes/groupings/:id/remove",
    "title": "Removes group from a grouping.",
    "name": "PutGroupings",
    "group": "Groupings",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The id of the course.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "teachers",
            "description": "<p>Array with the username of the teachers that you want to add to the grouping.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "groups",
            "description": "<p>Array with the id of the groups that you want to add to the grouping.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"name\": \"New Name\",\n    \"teachers: []\n    \"groups\": [\"559a447834376ce3485bf503\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf511\",\n    \"name\": \"New Name\",\n    \"classId\": \"559a447831b76cec185bf501\",\n    \"teachers\": [\"Teacher1\"]\n    \"groups\": [\"559a447834376ce3485bf503\", \"559a447834376cec185bf501\"]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/groupings.js",
    "groupTitle": "Groupings"
  },
  {
    "type": "put",
    "url": "/classes/groupings/:id",
    "title": "Changes the name of a grouping and the groups.",
    "name": "PutGroupings",
    "group": "Groupings",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The id of the course.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>The new name for the group</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "teachers",
            "description": "<p>Array with the username of the teachers that you want to add to the grouping.</p>"
          },
          {
            "group": "Parameter",
            "type": "String[]",
            "optional": true,
            "field": "groups",
            "description": "<p>Array with the id of the groups that you want to add to the grouping.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"name\": \"New Name\",\n    \"teachers: []\n    \"groups\": [\"559a447834376ce3485bf503\"]\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf511\",\n    \"name\": \"New Name\",\n    \"classId\": \"559a447831b76cec185bf501\",\n    \"teachers\": [\"Teacher1\"]\n    \"groups\": [\"559a447834376ce3485bf503\", \"559a447834376cec185bf501\"]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/groupings.js",
    "groupTitle": "Groupings"
  },
  {
    "type": "get",
    "url": "/classes/:id/groups",
    "title": "Return a list of the current groups",
    "name": "GetGroups",
    "group": "Groups",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"name\": \"Group1\",\n    \"classId\": \"559a447831b76cec185bf501\",\n    \"participants\": {\n        \"assistants\": [\"Assistant1\"]\n        \"teachers\": [\"Teacher1\"]\n        \"students\": [\"Student1\", \"Student2\"]\n      }\n}, {\n    \"_id\": \"559a447831b76cec185bf502\",\n    \"name\": \"Group2\",\n    \"classId\": \"559a447831b76cec185bf501\",\n    \"participants\": {\n        \"assistants\": [\"Assistant1\"]\n        \"teachers\": [\"Teacher2\"]\n        \"students\": [\"Student3\", \"Student4\"]\n     }\n}]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/groups.js",
    "groupTitle": "Groups"
  },
  {
    "type": "post",
    "url": "/classes/:id/groups",
    "title": "Creates new Group.",
    "name": "PostGroups",
    "group": "Groups",
    "parameter": {
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"name\": \"Name\",\n    \"classId\": \"559a447831b76cec185bf501\",\n    \"participants\": {\n        \"assistants\": [\"Assistant1\"]\n        \"teachers\": [\"Teacher1\"]\n        \"students\": [\"Student1\", \"Student2\", \"Student3\"]\n    }\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"name\": \"Name\",\n    \"classId\": \"559a447831b76cec185bf501\",\n    \"participants\": {\n        \"assistants\": [\"Assistant1\"]\n        \"teachers\": [\"Teacher1\"]\n        \"students\": [\"Student1\", \"Student2\", \"Student3\"]\n    }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/groups.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "/health",
    "title": "Check the api health.",
    "name": "Heath",
    "group": "Health",
    "permission": [
      {
        "name": "none"
      }
    ],
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"status\": \"Available\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/health.js",
    "groupTitle": "Health"
  },
  {
    "type": "GET",
    "url": "/api/kibana/classvis/",
    "title": "Returns kibana visualizations for class",
    "group": "Kibana",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The activity id</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"title\": \"dashboard_123\",\n    \"description2\": \"default visualization\",\n    \"panelsJSON\": \"[{ id:visualization_123, type:visualization, panelIndex: 1, size_x:3, size_y:2, col:1, row:1}]\",\n    \"optionsJSON\": \"{\"darkTheme\":false}\",\n    \"uiStateJSON\": \"{vis: {legendOpen: false}}\",\n    \"version\": 1,\n    \"timeRestore\": false,\n    \"kibanaSavedObjectMeta\": {\n        searchSourceJSON: '{\"filter\":[{\"query\":{\"query_string\":{\"query\":\"*\",\"analyze_wildcard\":true}}}]}'\n    }\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_index\": \".kibana\",\n    \"_type\": \"visualization\",\n    \"_id\": \"classId\",\n    \"_version\": 1,\n    \"_shards\": {\n        \"total\": 2,\n        \"successful\": 1,\n        \"failed\": 0\n    },\n    \"created\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "Kibana",
    "name": "GetApiKibanaClassvis"
  },
  {
    "type": "post",
    "url": "/api/kibana/dashboard/activity/:activityId",
    "title": "Adds a new dashboard in .kibana index of ElasticSearch.",
    "name": "PostDashboard",
    "group": "Kibana",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The activity id</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"title\": \"dashboard_123\",\n    \"description2\": \"default visualization\",\n    \"panelsJSON\": \"[{ id:visualization_123, type:visualization, panelIndex: 1, size_x:3, size_y:2, col:1, row:1}]\",\n    \"optionsJSON\": \"{\"darkTheme\":false}\",\n    \"uiStateJSON\": \"{vis: {legendOpen: false}}\",\n    \"version\": 1,\n    \"timeRestore\": false,\n    \"kibanaSavedObjectMeta\": {\n        searchSourceJSON: '{\"filter\":[{\"query\":{\"query_string\":{\"query\":\"*\",\"analyze_wildcard\":true}}}]}'\n    }\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_index\": \".kibana\",\n    \"_type\": \"visualization\",\n    \"_id\": \"activityId\",\n    \"_version\": 1,\n    \"_shards\": {\n        \"total\": 2,\n        \"successful\": 1,\n        \"failed\": 0\n    },\n    \"created\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "Kibana"
  },
  {
    "type": "post",
    "url": "/api/kibana/dashboard/class/:classId",
    "title": "Adds a new dashboard in .kibana index of ElasticSearch.",
    "name": "PostDashboardClass",
    "group": "Kibana",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The activity id</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"title\": \"dashboard_123\",\n    \"description2\": \"default visualization\",\n    \"panelsJSON\": \"[{ id:visualization_123, type:visualization, panelIndex: 1, size_x:3, size_y:2, col:1, row:1}]\",\n    \"optionsJSON\": \"{\"darkTheme\":false}\",\n    \"uiStateJSON\": \"{vis: {legendOpen: false}}\",\n    \"version\": 1,\n    \"timeRestore\": false,\n    \"kibanaSavedObjectMeta\": {\n        searchSourceJSON: '{\"filter\":[{\"query\":{\"query_string\":{\"query\":\"*\",\"analyze_wildcard\":true}}}]}'\n    }\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_index\": \".kibana\",\n    \"_type\": \"visualization\",\n    \"_id\": \"classId\",\n    \"_version\": 1,\n    \"_shards\": {\n        \"total\": 2,\n        \"successful\": 1,\n        \"failed\": 0\n    },\n    \"created\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "Kibana"
  },
  {
    "type": "post",
    "url": "/api/kibana/index/:indexTemplate/:indexName",
    "title": "Adds a new index using the template indexTemplate of ElasticSearch.",
    "name": "PostIndex",
    "group": "Kibana",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "indexTemplate",
            "description": "<p>The index template id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "indexName",
            "description": "<p>The index name</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_index\": \".kibana\",\n    \"_type\": \"index-pattern\",\n    \"_id\": \"0535H53W34g\",\n    \"_version\": 1,\n    \"_shards\": {\n        \"total\": 2,\n        \"successful\": 1,\n        \"failed\": 0\n    },\n    \"created\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "Kibana"
  },
  {
    "type": "post",
    "url": "/api/kibana/classindex//:classId",
    "title": "Adds a new index using the classId.",
    "name": "PostIndex",
    "group": "Kibana",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "classId",
            "description": "<p>The class id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_index\": \".kibana\",\n    \"_type\": \"index-pattern\",\n    \"_id\": \"0535H53W34g\",\n    \"_version\": 1,\n    \"_shards\": {\n        \"total\": 2,\n        \"successful\": 1,\n        \"failed\": 0\n    },\n    \"created\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "Kibana"
  },
  {
    "type": "post",
    "url": "/api/kibana/visualization/activity/:gameId/:visualizationId/:activityId",
    "title": "Adds new visualization using the template visualizationId.",
    "name": "PostVisualization",
    "group": "Kibana",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>The game id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "visualizationId",
            "description": "<p>The visualization id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The version or activity id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_index\": \".kibana\",\n    \"_type\": \"visualization\",\n    \"_id\": \"activityId\",\n    \"_version\": 1,\n    \"_shards\": {\n        \"total\": 2,\n        \"successful\": 1,\n        \"failed\": 0\n    },\n    \"created\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "Kibana"
  },
  {
    "type": "post",
    "url": "/api/kibana/visualization/class/:classId",
    "title": "Adds new visualization using the template visualization from the body",
    "name": "PostVisualizationClass",
    "group": "Kibana",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Body",
            "description": "<p>of the request The visualization</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "classId",
            "description": "<p>The class id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_index\": \".kibana\",\n    \"_type\": \"visualization\",\n    \"_id\": \"activityId\",\n    \"_version\": 1,\n    \"_shards\": {\n        \"total\": 2,\n        \"successful\": 1,\n        \"failed\": 0\n    },\n    \"created\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "Kibana"
  },
  {
    "type": "get",
    "url": "lti/key/:id",
    "title": "Returns a lti object with the id.",
    "name": "GetLti",
    "group": "Lti",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n        \"_id\": \"559a447831b7acec185bf513\",\n        \"secret\": \"42231831hf384hf1gf478393\",\n        \"classId\": \"1543j413o459046k42h39843\"\n    }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/lti.js",
    "groupTitle": "Lti"
  },
  {
    "type": "get",
    "url": "lti/keyid/:classId",
    "title": "Return the lti object that satisfy.",
    "name": "GetLti",
    "group": "Lti",
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n    {\n        \"_id\": \"559a447831b7acec185bf513\",\n        \"secret\": \"42231831hf384hf1gf478393\",\n        \"classId\": \"classId\"\n    }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/lti.js",
    "groupTitle": "Lti"
  },
  {
    "type": "post",
    "url": "/lti",
    "title": "Adds a new lti object.",
    "name": "PostLti",
    "group": "Lti",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "secret",
            "description": "<p>The title of the game.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "sessionId",
            "description": "<p>if the lti object is generate for a session.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "classId",
            "description": "<p>if the lti object is generate for a class.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "versionId",
            "description": "<p>if the lti object is generate for a game.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "gameId",
            "description": "<p>if the lti object is generate for a game.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"secret\": \"MySecrete\",\n    \"classId\": \"1543j413o459046k42h39843\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b7acec185bf513\",\n    \"secret\": \"MySecrete\"\n    \"classId\": \"1543j413o459046k42h39843\",\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/lti.js",
    "groupTitle": "Lti"
  },
  {
    "type": "get",
    "url": "/api/kibana/object/:versionId",
    "title": "Return the index with the id.",
    "name": "GetIndexObject",
    "group": "Object",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "gameId",
            "description": "<p>The game id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "Object"
  },
  {
    "type": "post",
    "url": "/api/kibana/object/:versionId",
    "title": "saves the given index object",
    "name": "PostIndexObject",
    "group": "Object",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The visualization id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "Object"
  },
  {
    "type": "get",
    "url": "/api/offlinetraces/:activityId/kahoot Returns the Kahoot offlinetraces",
    "title": "(meta-information about the uploaded Kahoot results file) that has the given id.",
    "name": "GetOflinetraces",
    "group": "Oflinetraces",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The Analysis id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"kahoot\": true,\n    \"name\": \"results.xslx\",\n    \"activityId\": \"559a447831b76cec185bf502\",\n    \"author\": \"David\",\n    \"timestamp\": \"2015-07-06T09:00:50.630Z\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/offlinetraces.js",
    "groupTitle": "Oflinetraces"
  },
  {
    "type": "get",
    "url": "/api/offlinetraces/:activityId Returns the offlinetraces",
    "title": "(meta-information about the uploaded CSV file) that has the given id.",
    "name": "GetOflinetraces",
    "group": "Oflinetraces",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The Analysis id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"name\": \"tracesdata.csv\",\n    \"activityId\": \"559a447831b76cec185bf502\",\n    \"author\": \"David\",\n    \"timestamp\": \"2015-07-06T09:00:50.630Z\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/offlinetraces.js",
    "groupTitle": "Oflinetraces"
  },
  {
    "type": "post",
    "url": "/offlinetraces/:analisysId/",
    "title": "Adds a new OfflineTraces for a given versionId",
    "name": "PostOflinetraces",
    "group": "Oflinetraces",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "analysisId",
            "description": "<p>The id of the analysis.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "{} Request-Example:",
          "content": "A .csv file with the traces in CSV:\n  XJIR,1523611057499,initialized,level,A\n  KVDC,1523611057500,initialized,level,A\n  XJIR,1523611057510,interacted,gameobject,15Objects-A,Bombilla,1\n  KVDC,1523611057623,selected,alternative,A,success,true,response,bombilla,mappings_Bombilla, bombilla,targets,Bombilla=true,bombilla,802,object-changed,0,correct,1\n  XJIR,1523611057728,interacted,gameobject,15Objects-A,Bombilla,1\n  KVDC,selected,alternative,A,success,false,response,pipa,mappings_Bombilla, ,targets,Bombilla=false,object-changed,0,correct,0",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"name\": \"realtime.jar\",\n    \"activityId\": \"559a447831b76cec185bf502\",\n    \"author\": \"David\",\n    \"timestamp\": \"2015-07-06T09:00:50.630Z\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/offlinetraces.js",
    "groupTitle": "Oflinetraces"
  },
  {
    "type": "post",
    "url": "/offlinetraces/:analisysId/kahoot",
    "title": "Adds a new Kahoot OfflineTraces for a given versionId",
    "name": "PostOflinetraces",
    "group": "Oflinetraces",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "analysisId",
            "description": "<p>The id of the analysis.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "{} Request-Example:",
          "content": "An .xlsx file with the KAHOOT traces following the correct format:\nhttps://kahoot.com/blog/2017/02/20/download-evaluate-kahoot-results-data/",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_id\": \"559a447831b76cec185bf501\",\n    \"name\": \"realtime.jar\",\n    \"activityId\": \"559a447831b76cec185bf502\",\n    \"author\": \"David\",\n    \"timestamp\": \"2015-07-06T09:00:50.630Z\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/offlinetraces.js",
    "groupTitle": "Oflinetraces"
  },
  {
    "type": "get",
    "url": "/statements",
    "title": "Returns all statements.",
    "name": "GetSessions",
    "group": "Sessions",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The Session id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"statements\": [\n    {\n        \"id\": \"e5efec39-3992-401d-be17-86d24c3f1e76\",\n        \"actor\": {\n        \"objectType\": \"Agent\",\n        \"name\": \"s\",\n        \"account\": {\n            \"homePage\": \"http://www.gleaner.com/\",\n            \"name\": \"s\"\n        }\n    },\n    \"verb\": {\n        \"id\": \"http://www.gleaner.com/started_game\",\n        \"display\": {\n            \"es-ES\": \"started_game\",\n            \"en-US\": \"started_game\"\n        }\n    },\n    \"object\": {\n        \"id\": \"http://www.gleaner.com/games/lostinspace/none\",\n        \"objectType\": \"Activity\",\n        \"definition\": {\n            \"type\": \"http://www.gleaner.com/objects/none\",\n            \"extensions\": {\n                \"event\": \"game_start\",\n                \"gameplayId\": \"55e57b03553dded764546f03\"\n            }\n        }\n    },\n    \"stored\": \"2015-09-10T11:01:04Z\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Sessions"
  },
  {
    "type": "get",
    "url": "/games/my",
    "title": "Return all games of the author in the x-gleaner-user header.",
    "name": "getSessions",
    "group": "Sessions",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-gleaner-user.",
            "description": ""
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "  HTTP/1.1 200 OK\n[\n  {\n      \"_id\": \"559a447831b76cec185bf511\",\n      \"title\": \"My Game\",\n      \"created\": \"2017-07-06T09:00:52.630Z\",\n      \"authors\": [\"someDeveloper\"],\n      \"developers\": [\"someDeveloper\"],\n      \"public\": \"true\",\n      \"deleted\": \"false\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/games.js",
    "groupTitle": "Sessions"
  },
  {
    "type": "get",
    "url": "/api/kibana/templates/index/:id",
    "title": "Return the template with the id.",
    "name": "GetTemplate",
    "group": "Template",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The template id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_index\": \".template\",\n    \"_type\": \"index\",\n    \"_id\": \"5767d5852fc65e241be46b71\",\n    \"_score\": 1,\n    \"_source\": {\n    \"title\": \"defaultIndex\",\n    \"timeFieldName\": \"timestamp\",\n    \"fields\": \"[{\\\"name\\\":\\\"_index\\\",\\\"type\\\":\\\"string\\\",\\\"count\\\":0,\\\"scripted\\\":false,\\\"indexed\\\":false,\\\"analyzed\\\":false,\\\"doc_values\\\":false}]\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "Template"
  },
  {
    "type": "get",
    "url": "/api/kibana/templates/:idAuthor",
    "title": "Return a list with the author's visualizations.",
    "name": "GetVisualization",
    "group": "Template",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "idAuthor",
            "description": "<p>The author id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[{\n    id: 'visualization1',\n    title: 'title1'\n    isDeveloper: false,\n    isTeacher: false\n  },{\n    id: 'visualization2',\n    title: 'title2'\n    isDeveloper: true,\n    isTeacher: true\n  },{'\n    id: 'visualization5',\n    title: 'title5',\n    isDeveloper: true,\n    isTeacher: false\n  }]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "Template"
  },
  {
    "type": "get",
    "url": "/api/kibana/templates/fields/:id",
    "title": "Return the fields of visualization with the id.",
    "name": "GetVisualizationFields",
    "group": "Template",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The visualization id</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n['field1', 'field2', 'field3']",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "Template"
  },
  {
    "type": "post",
    "url": "/api/kibana/templates/:type/author/:idAuthor",
    "title": "Adds a new template in .template index of ElasticSearch.",
    "description": "<p>:type must be visualization or index</p>",
    "name": "PostTemplate",
    "group": "Template",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>The template type</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "idAuthor",
            "description": "<p>The author of template</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_index\": \".template\",\n    \"_type\": \"visualization\",\n    \"_id\": \"template_visualization\",\n    \"_version\": 1,\n    \"_shards\": {\n        \"total\": 2,\n        \"successful\": 1,\n        \"failed\": 0\n    },\n    \"created\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "Template"
  },
  {
    "type": "post",
    "url": "/api/kibana/templates/:type/:id",
    "title": "Adds a new template in .template index of ElasticSearch.",
    "description": "<p>:type must be visualization or index</p>",
    "name": "PostTemplate",
    "group": "Template",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>The visualization id</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>Visualization or index</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "optional": false,
            "field": "Success.",
            "description": ""
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n    \"_index\": \".template\",\n    \"_type\": \"visualization\",\n    \"_id\": \"template_visualization\",\n    \"_version\": 1,\n    \"_shards\": {\n        \"total\": 2,\n        \"successful\": 1,\n        \"failed\": 0\n    },\n    \"created\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "routes/kibana.js",
    "groupTitle": "Template"
  }
] });