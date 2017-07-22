// tslint:disable:object-literal-key-quotes trailing-comma
export const appTemplateHtml = `<div><h4>Log Tool</h4><tab-container :data="data" @switching="switching($event)"></tab-container></div>`;
export const othersTemplateHtml = `<div class="panel"><button class="btn btn-primary" @click="resaveFailedLogs()">resave failed logs</button></div>`;
export const realtimeLogsTemplateHtml = `<div class="panel"><div><button class="btn btn-default btn-sm" @click="clearLogsPush()" :disabled="logsPush.length === 0">clear</button><label><input type="checkbox" v-model="showRawLogPush"> show raw data</label><label><input type="checkbox" v-model="showFormattedLogPush"> show formatted data</label></div><ul><li class="hide-button-container li-result-item" v-for="(log, index) in logsPush"><span class="label label-primary"><relative-time :time="log.timeValue" :locale="locale"></relative-time></span><span class="label label-default">{{log.hostname}}</span><span class="label label-default">{{log.filepath}}</span><pre v-if="log.content && showRawLogPush">{{log.content}}</pre><pre :id="logPushId(index)" v-if="log.formattedContent && showFormattedLogPush && log.visible">{{log.formattedContent}}</pre><button class="btn btn-default btn-sm" :style="visibilityButtonStyle(log)" @click="toggleVisibility(log)" v-if="log.formattedContent && showFormattedLogPush">{{ log.visible ? "hide formatted" : "show formatted" }}</button></li></ul></div>`;
export const realtimeSamplesTemplateHtml = `<div class="panel"><ul class="menu"><li v-for="(config, index) in chartConfigs"><a href="javascript:void(0)" @click="scrollBy(config.name)">{{config.description}}</a></li></ul><div v-for="(config, index) in chartConfigs"><h4 style="padding-top: 10px">{{config.description}} {{config.unit !== undefined ? ("(" + config.unit + ")") : ""}} {{config.sum !== undefined ? (" " + config.sum) : ""}}</h4><canvas :id="'current-' + config.name" class="graph" :width="chartWidth" height="300"></canvas></div></div>`;
export const searchLogsTemplateHtml = `<div class="panel"><div class="flex-center"><input class="form-control" v-model="content" title="content" @keyup.enter="search(true)"> <input class="form-control" v-model="time" title="time" @keyup.enter="search(true)"> <input class="form-control" v-model="hostname" titme="hostname" @keyup.enter="search(true)"><button class="btn btn-primary btn-lg primary-button" @click="search(true)" :disabled="!content">search</button></div><div><button class="btn btn-default btn-sm" @click="clearLogsSearchResult()" :disabled="logsSearchResult.length === 0">clear</button><label><input type="checkbox" v-model="showRawLogResult"> show raw data</label><label><input type="checkbox" v-model="showFormattedLogResult"> show formatted data</label></div><ul><li class="li-result-item" v-if="logsSearchResult.length === 0"><pre class="pre">not started or nothing found.</pre></li><li class="hide-button-container li-result-item" v-for="(log, index) in logsSearchResult"><span class="label label-primary"><relative-time :time="log.timeValue" :locale="locale"></relative-time></span><span class="label label-default">{{log.hostname}}</span><span class="label label-default">{{log.filepath}}</span><pre class="pre" v-if="log.content && showRawLogResult" v-html="log.content"></pre><pre class="pre" :id="logSearchResultId(index)" v-if="log.formattedContent && showFormattedLogResult && log.visible" v-html="log.formattedContent"></pre><button class="btn btn-default btn-sm" :style="visibilityButtonStyle(log)" @click="toggleVisibility(log)" v-if="log.formattedContent && showFormattedLogResult">{{ log.visible ? "hide formatted" : "show formatted" }}</button></li></ul><div v-if="logsSearchResult.length > 0 && leftCount > 0"><button class="btn btn-primary" @click="search(false)">continue<span class="badge">{{leftCount}}</span></button></div></div>`;
export const searchSamplesTemplateHtml = `<div class="panel"><div class="flex-center"><input class="form-control" style="width: 30%" v-model="searchFrom"> <input class="form-control" style="width: 30%" v-model="searchTo"><button class="btn btn-primary btn-lg primary-button" @click="searchSamples()" :disabled="!searchFrom || !searchTo">search</button></div><ul class="menu list-unstyled"><li v-for="(config, index) in chartConfigs"><a :href="'#' + config.name">{{config.description}}</a></li></ul><div v-for="(config, index) in chartConfigs"><h4 :id="config.name" style="padding-top: 10px">{{config.description}} {{config.unit !== undefined ? ("(" + config.unit + ")") : ""}}</h4><canvas :id="'history-' + config.name" class="graph" :width="chartWidth" height="300"></canvas></div></div>`;
export const protocolProto = {
    "nested": {
        "RequestProtocol": {
            "fields": {
                "requestId": {
                    "rule": "required",
                    "type": "uint32",
                    "id": 1
                },
                "kind": {
                    "rule": "required",
                    "type": "string",
                    "id": 2
                },
                "searchLogs": {
                    "type": "SearchLogs",
                    "id": 3
                },
                "searchSamples": {
                    "type": "SearchSamples",
                    "id": 4
                }
            }
        },
        "SearchLogs": {
            "fields": {
                "content": {
                    "rule": "required",
                    "type": "string",
                    "id": 1
                },
                "time": {
                    "rule": "required",
                    "type": "string",
                    "id": 2
                },
                "hostname": {
                    "rule": "required",
                    "type": "string",
                    "id": 3
                },
                "from": {
                    "rule": "required",
                    "type": "uint32",
                    "id": 4
                },
                "size": {
                    "rule": "required",
                    "type": "uint32",
                    "id": 5
                }
            }
        },
        "SearchSamples": {
            "fields": {
                "from": {
                    "rule": "required",
                    "type": "string",
                    "id": 1
                },
                "to": {
                    "rule": "required",
                    "type": "string",
                    "id": 2
                }
            }
        },
        "ResponseProtocol": {
            "fields": {
                "kind": {
                    "rule": "required",
                    "type": "string",
                    "id": 1
                },
                "flows": {
                    "type": "Flows",
                    "id": 2
                },
                "historySamples": {
                    "rule": "repeated",
                    "type": "SampleFrame",
                    "id": 3
                },
                "searchLogsResult": {
                    "type": "SearchLogsResult",
                    "id": 4
                },
                "searchSamplesResult": {
                    "rule": "repeated",
                    "type": "SearchSamplesResult",
                    "id": 5
                },
                "resaveFailedLogsResult": {
                    "type": "ResaveFailedLogsResult",
                    "id": 6
                }
            }
        },
        "Flows": {
            "fields": {
                "serverTime": {
                    "rule": "required",
                    "type": "string",
                    "id": 1
                },
                "flows": {
                    "rule": "repeated",
                    "type": "Flow",
                    "id": 2
                }
            }
        },
        "SearchLogsResult": {
            "fields": {
                "kind": {
                    "rule": "required",
                    "type": "string",
                    "id": 1
                },
                "requestId": {
                    "rule": "required",
                    "type": "uint32",
                    "id": 2
                },
                "error": {
                    "type": "string",
                    "id": 3
                },
                "total": {
                    "type": "uint32",
                    "id": 4
                },
                "logs": {
                    "rule": "repeated",
                    "type": "Log",
                    "id": 5
                }
            }
        },
        "SearchSamplesResult": {
            "fields": {
                "kind": {
                    "rule": "required",
                    "type": "string",
                    "id": 1
                },
                "requestId": {
                    "rule": "required",
                    "type": "uint32",
                    "id": 2
                },
                "error": {
                    "type": "string",
                    "id": 3
                },
                "searchSampleResult": {
                    "rule": "repeated",
                    "type": "SampleFrame",
                    "id": 4
                }
            }
        },
        "ResaveFailedLogsResult": {
            "fields": {
                "kind": {
                    "rule": "required",
                    "type": "string",
                    "id": 1
                },
                "requestId": {
                    "rule": "required",
                    "type": "uint32",
                    "id": 2
                },
                "error": {
                    "type": "string",
                    "id": 3
                },
                "savedCount": {
                    "type": "uint32",
                    "id": 4
                },
                "totalCount": {
                    "type": "uint32",
                    "id": 5
                }
            }
        },
        "SampleFrame": {
            "fields": {
                "time": {
                    "rule": "required",
                    "type": "string",
                    "id": 1
                },
                "samples": {
                    "rule": "repeated",
                    "type": "Sample",
                    "id": 2
                }
            }
        },
        "FlowProtocol": {
            "fields": {
                "flows": {
                    "type": "Flows",
                    "id": 1
                }
            }
        },
        "Flow": {
            "fields": {
                "kind": {
                    "rule": "required",
                    "type": "string",
                    "id": 1
                },
                "log": {
                    "type": "Log",
                    "id": 2
                },
                "sample": {
                    "type": "Sample",
                    "id": 3
                }
            }
        },
        "Log": {
            "fields": {
                "time": {
                    "rule": "required",
                    "type": "string",
                    "id": 1
                },
                "content": {
                    "rule": "required",
                    "type": "string",
                    "id": 2
                },
                "filepath": {
                    "rule": "required",
                    "type": "string",
                    "id": 3
                },
                "hostname": {
                    "rule": "required",
                    "type": "string",
                    "id": 4
                }
            }
        },
        "Sample": {
            "fields": {
                "hostname": {
                    "rule": "required",
                    "type": "string",
                    "id": 1
                },
                "port": {
                    "type": "uint32",
                    "id": 2
                },
                "values": {
                    "keyType": "string",
                    "type": "uint32",
                    "id": 3
                }
            }
        }
    }
};
export const flowProtocolJson = {
  "$ref": "#/definitions/Flow",
  "definitions": {
    "RequestProtocol": {
      "type": "object",
      "properties": {
        "requestId": {
          "type": "integer",
          "minimum": 1,
          "maximum": 4294967295
        },
        "kind": {
          "type": "string",
          "enum": [
            "search logs",
            "search samples",
            "resave failed logs"
          ]
        },
        "searchLogs": {
          "$ref": "#/definitions/SearchLogs"
        },
        "searchSamples": {
          "$ref": "#/definitions/SearchSamples"
        }
      },
      "required": [
        "requestId",
        "kind"
      ],
      "maxProperties": 3,
      "minProperties": 2
    },
    "SearchLogs": {
      "type": "object",
      "properties": {
        "content": {
          "type": "string"
        },
        "time": {
          "type": "string"
        },
        "hostname": {
          "type": "string"
        },
        "from": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "size": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        }
      },
      "required": [
        "content",
        "time",
        "hostname",
        "from",
        "size"
      ],
      "maxProperties": 5,
      "minProperties": 5
    },
    "SearchSamples": {
      "type": "object",
      "properties": {
        "from": {
          "type": "string"
        },
        "to": {
          "type": "string"
        }
      },
      "required": [
        "from",
        "to"
      ],
      "maxProperties": 2,
      "minProperties": 2
    },
    "ResponseProtocol": {
      "type": "object",
      "properties": {
        "kind": {
          "type": "string",
          "enum": [
            "flows",
            "history samples",
            "search logs result",
            "search samples result",
            "resave failed logs result"
          ]
        },
        "flows": {
          "$ref": "#/definitions/Flows"
        },
        "historySamples": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/SampleFrame"
          }
        },
        "searchLogsResult": {
          "$ref": "#/definitions/SearchLogsResult"
        },
        "searchSampleResult": {
          "$ref": "#/definitions/SearchSamplesResult"
        },
        "resaveFailedLogsResult": {
          "$ref": "#/definitions/ResaveFailedLogsResult"
        }
      },
      "required": [
        "kind"
      ],
      "maxProperties": 2,
      "minProperties": 1
    },
    "Flows": {
      "type": "object",
      "properties": {
        "serverTime": {
          "type": "string"
        },
        "flows": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Flow"
          }
        }
      },
      "required": [
        "serverTime"
      ],
      "maxProperties": 2,
      "minProperties": 1
    },
    "SearchLogsResult": {
      "type": "object",
      "properties": {
        "requestId": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "kind": {
          "type": "string",
          "enum": [
            "success",
            "fail"
          ]
        },
        "total": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "logs": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Log"
          }
        },
        "error": {
          "type": "string"
        }
      },
      "required": [
        "requestId",
        "kind"
      ],
      "maxProperties": 4,
      "minProperties": 3
    },
    "SearchSamplesResult": {
      "type": "object",
      "properties": {
        "requestId": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "kind": {
          "type": "string",
          "enum": [
            "success",
            "fail"
          ]
        },
        "searchSampleResult": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/SampleFrame"
          }
        },
        "error": {
          "type": "string"
        }
      },
      "required": [
        "requestId",
        "kind"
      ],
      "maxProperties": 3,
      "minProperties": 2
    },
    "ResaveFailedLogsResult": {
      "type": "object",
      "properties": {
        "requestId": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "kind": {
          "type": "string",
          "enum": [
            "success",
            "fail"
          ]
        },
        "savedCount": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "totalCount": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "error": {
          "type": "string"
        }
      },
      "required": [
        "requestId",
        "kind"
      ],
      "maxProperties": 4,
      "minProperties": 3
    },
    "SampleFrame": {
      "type": "object",
      "properties": {
        "time": {
          "type": "string"
        },
        "samples": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Sample"
          }
        }
      },
      "required": [
        "time"
      ],
      "maxProperties": 2,
      "minProperties": 1
    },
    "FlowProtocol": {
      "type": "object",
      "properties": {
        "flows": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Flow"
          }
        }
      },
      "maxProperties": 1,
      "minProperties": 0
    },
    "Flow": {
      "type": "object",
      "properties": {
        "kind": {
          "type": "string",
          "enum": [
            "log",
            "sample"
          ]
        },
        "log": {
          "$ref": "#/definitions/Log"
        },
        "sample": {
          "$ref": "#/definitions/Sample"
        }
      },
      "required": [
        "kind"
      ],
      "maxProperties": 2,
      "minProperties": 2
    },
    "Log": {
      "type": "object",
      "properties": {
        "time": {
          "type": "string"
        },
        "content": {
          "type": "string"
        },
        "filepath": {
          "type": "string"
        },
        "hostname": {
          "type": "string"
        }
      },
      "required": [
        "time",
        "content",
        "filepath",
        "hostname"
      ],
      "maxProperties": 4,
      "minProperties": 4
    },
    "Sample": {
      "type": "object",
      "properties": {
        "hostname": {
          "type": "string"
        },
        "port": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "values": {
          "type": "object",
          "additionalProperties": {
            "type": "integer",
            "minimum": 0,
            "maximum": 4294967295
          }
        }
      },
      "required": [
        "hostname",
        "values"
      ],
      "maxProperties": 3,
      "minProperties": 2
    }
  }
};
export const requestProtocolJson = {
  "$ref": "#/definitions/RequestProtocol",
  "definitions": {
    "RequestProtocol": {
      "type": "object",
      "properties": {
        "requestId": {
          "type": "integer",
          "minimum": 1,
          "maximum": 4294967295
        },
        "kind": {
          "type": "string",
          "enum": [
            "search logs",
            "search samples",
            "resave failed logs"
          ]
        },
        "searchLogs": {
          "$ref": "#/definitions/SearchLogs"
        },
        "searchSamples": {
          "$ref": "#/definitions/SearchSamples"
        }
      },
      "required": [
        "requestId",
        "kind"
      ],
      "maxProperties": 3,
      "minProperties": 2
    },
    "SearchLogs": {
      "type": "object",
      "properties": {
        "content": {
          "type": "string"
        },
        "time": {
          "type": "string"
        },
        "hostname": {
          "type": "string"
        },
        "from": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "size": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        }
      },
      "required": [
        "content",
        "time",
        "hostname",
        "from",
        "size"
      ],
      "maxProperties": 5,
      "minProperties": 5
    },
    "SearchSamples": {
      "type": "object",
      "properties": {
        "from": {
          "type": "string"
        },
        "to": {
          "type": "string"
        }
      },
      "required": [
        "from",
        "to"
      ],
      "maxProperties": 2,
      "minProperties": 2
    },
    "ResponseProtocol": {
      "type": "object",
      "properties": {
        "kind": {
          "type": "string",
          "enum": [
            "flows",
            "history samples",
            "search logs result",
            "search samples result",
            "resave failed logs result"
          ]
        },
        "flows": {
          "$ref": "#/definitions/Flows"
        },
        "historySamples": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/SampleFrame"
          }
        },
        "searchLogsResult": {
          "$ref": "#/definitions/SearchLogsResult"
        },
        "searchSampleResult": {
          "$ref": "#/definitions/SearchSamplesResult"
        },
        "resaveFailedLogsResult": {
          "$ref": "#/definitions/ResaveFailedLogsResult"
        }
      },
      "required": [
        "kind"
      ],
      "maxProperties": 2,
      "minProperties": 1
    },
    "Flows": {
      "type": "object",
      "properties": {
        "serverTime": {
          "type": "string"
        },
        "flows": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Flow"
          }
        }
      },
      "required": [
        "serverTime"
      ],
      "maxProperties": 2,
      "minProperties": 1
    },
    "SearchLogsResult": {
      "type": "object",
      "properties": {
        "requestId": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "kind": {
          "type": "string",
          "enum": [
            "success",
            "fail"
          ]
        },
        "total": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "logs": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Log"
          }
        },
        "error": {
          "type": "string"
        }
      },
      "required": [
        "requestId",
        "kind"
      ],
      "maxProperties": 4,
      "minProperties": 3
    },
    "SearchSamplesResult": {
      "type": "object",
      "properties": {
        "requestId": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "kind": {
          "type": "string",
          "enum": [
            "success",
            "fail"
          ]
        },
        "searchSampleResult": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/SampleFrame"
          }
        },
        "error": {
          "type": "string"
        }
      },
      "required": [
        "requestId",
        "kind"
      ],
      "maxProperties": 3,
      "minProperties": 2
    },
    "ResaveFailedLogsResult": {
      "type": "object",
      "properties": {
        "requestId": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "kind": {
          "type": "string",
          "enum": [
            "success",
            "fail"
          ]
        },
        "savedCount": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "totalCount": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "error": {
          "type": "string"
        }
      },
      "required": [
        "requestId",
        "kind"
      ],
      "maxProperties": 4,
      "minProperties": 3
    },
    "SampleFrame": {
      "type": "object",
      "properties": {
        "time": {
          "type": "string"
        },
        "samples": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Sample"
          }
        }
      },
      "required": [
        "time"
      ],
      "maxProperties": 2,
      "minProperties": 1
    },
    "FlowProtocol": {
      "type": "object",
      "properties": {
        "flows": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Flow"
          }
        }
      },
      "maxProperties": 1,
      "minProperties": 0
    },
    "Flow": {
      "type": "object",
      "properties": {
        "kind": {
          "type": "string",
          "enum": [
            "log",
            "sample"
          ]
        },
        "log": {
          "$ref": "#/definitions/Log"
        },
        "sample": {
          "$ref": "#/definitions/Sample"
        }
      },
      "required": [
        "kind"
      ],
      "maxProperties": 2,
      "minProperties": 2
    },
    "Log": {
      "type": "object",
      "properties": {
        "time": {
          "type": "string"
        },
        "content": {
          "type": "string"
        },
        "filepath": {
          "type": "string"
        },
        "hostname": {
          "type": "string"
        }
      },
      "required": [
        "time",
        "content",
        "filepath",
        "hostname"
      ],
      "maxProperties": 4,
      "minProperties": 4
    },
    "Sample": {
      "type": "object",
      "properties": {
        "hostname": {
          "type": "string"
        },
        "port": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "values": {
          "type": "object",
          "additionalProperties": {
            "type": "integer",
            "minimum": 0,
            "maximum": 4294967295
          }
        }
      },
      "required": [
        "hostname",
        "values"
      ],
      "maxProperties": 3,
      "minProperties": 2
    }
  }
};
export const responseProtocolJson = {
  "$ref": "#/definitions/ResponseProtocol",
  "definitions": {
    "RequestProtocol": {
      "type": "object",
      "properties": {
        "requestId": {
          "type": "integer",
          "minimum": 1,
          "maximum": 4294967295
        },
        "kind": {
          "type": "string",
          "enum": [
            "search logs",
            "search samples",
            "resave failed logs"
          ]
        },
        "searchLogs": {
          "$ref": "#/definitions/SearchLogs"
        },
        "searchSamples": {
          "$ref": "#/definitions/SearchSamples"
        }
      },
      "required": [
        "requestId",
        "kind"
      ],
      "maxProperties": 3,
      "minProperties": 2
    },
    "SearchLogs": {
      "type": "object",
      "properties": {
        "content": {
          "type": "string"
        },
        "time": {
          "type": "string"
        },
        "hostname": {
          "type": "string"
        },
        "from": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "size": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        }
      },
      "required": [
        "content",
        "time",
        "hostname",
        "from",
        "size"
      ],
      "maxProperties": 5,
      "minProperties": 5
    },
    "SearchSamples": {
      "type": "object",
      "properties": {
        "from": {
          "type": "string"
        },
        "to": {
          "type": "string"
        }
      },
      "required": [
        "from",
        "to"
      ],
      "maxProperties": 2,
      "minProperties": 2
    },
    "ResponseProtocol": {
      "type": "object",
      "properties": {
        "kind": {
          "type": "string",
          "enum": [
            "flows",
            "history samples",
            "search logs result",
            "search samples result",
            "resave failed logs result"
          ]
        },
        "flows": {
          "$ref": "#/definitions/Flows"
        },
        "historySamples": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/SampleFrame"
          }
        },
        "searchLogsResult": {
          "$ref": "#/definitions/SearchLogsResult"
        },
        "searchSampleResult": {
          "$ref": "#/definitions/SearchSamplesResult"
        },
        "resaveFailedLogsResult": {
          "$ref": "#/definitions/ResaveFailedLogsResult"
        }
      },
      "required": [
        "kind"
      ],
      "maxProperties": 2,
      "minProperties": 1
    },
    "Flows": {
      "type": "object",
      "properties": {
        "serverTime": {
          "type": "string"
        },
        "flows": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Flow"
          }
        }
      },
      "required": [
        "serverTime"
      ],
      "maxProperties": 2,
      "minProperties": 1
    },
    "SearchLogsResult": {
      "type": "object",
      "properties": {
        "requestId": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "kind": {
          "type": "string",
          "enum": [
            "success",
            "fail"
          ]
        },
        "total": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "logs": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Log"
          }
        },
        "error": {
          "type": "string"
        }
      },
      "required": [
        "requestId",
        "kind"
      ],
      "maxProperties": 4,
      "minProperties": 3
    },
    "SearchSamplesResult": {
      "type": "object",
      "properties": {
        "requestId": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "kind": {
          "type": "string",
          "enum": [
            "success",
            "fail"
          ]
        },
        "searchSampleResult": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/SampleFrame"
          }
        },
        "error": {
          "type": "string"
        }
      },
      "required": [
        "requestId",
        "kind"
      ],
      "maxProperties": 3,
      "minProperties": 2
    },
    "ResaveFailedLogsResult": {
      "type": "object",
      "properties": {
        "requestId": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "kind": {
          "type": "string",
          "enum": [
            "success",
            "fail"
          ]
        },
        "savedCount": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "totalCount": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "error": {
          "type": "string"
        }
      },
      "required": [
        "requestId",
        "kind"
      ],
      "maxProperties": 4,
      "minProperties": 3
    },
    "SampleFrame": {
      "type": "object",
      "properties": {
        "time": {
          "type": "string"
        },
        "samples": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Sample"
          }
        }
      },
      "required": [
        "time"
      ],
      "maxProperties": 2,
      "minProperties": 1
    },
    "FlowProtocol": {
      "type": "object",
      "properties": {
        "flows": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Flow"
          }
        }
      },
      "maxProperties": 1,
      "minProperties": 0
    },
    "Flow": {
      "type": "object",
      "properties": {
        "kind": {
          "type": "string",
          "enum": [
            "log",
            "sample"
          ]
        },
        "log": {
          "$ref": "#/definitions/Log"
        },
        "sample": {
          "$ref": "#/definitions/Sample"
        }
      },
      "required": [
        "kind"
      ],
      "maxProperties": 2,
      "minProperties": 2
    },
    "Log": {
      "type": "object",
      "properties": {
        "time": {
          "type": "string"
        },
        "content": {
          "type": "string"
        },
        "filepath": {
          "type": "string"
        },
        "hostname": {
          "type": "string"
        }
      },
      "required": [
        "time",
        "content",
        "filepath",
        "hostname"
      ],
      "maxProperties": 4,
      "minProperties": 4
    },
    "Sample": {
      "type": "object",
      "properties": {
        "hostname": {
          "type": "string"
        },
        "port": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "values": {
          "type": "object",
          "additionalProperties": {
            "type": "integer",
            "minimum": 0,
            "maximum": 4294967295
          }
        }
      },
      "required": [
        "hostname",
        "values"
      ],
      "maxProperties": 3,
      "minProperties": 2
    }
  }
};
// tslint:enable:object-literal-key-quotes trailing-comma
