// tslint:disable:object-literal-key-quotes trailing-comma
export const appTemplateHtml = `<div><h4>Log Tool</h4><tab-container :data="data" @switching="switching($event)"></tab-container></div>`;
export const othersTemplateHtml = `<div class="panel"><button class="btn btn-primary" @click="resaveFailedLogs()">resave failed logs</button></div>`;
export const realtimeLogsTemplateHtml = `<div class="panel"><div><button class="btn btn-default btn-sm" @click="clearLogsPush()" :disabled="logsPush.length === 0">clear</button><label><input type="checkbox" v-model="showRawLogPush"> show raw data</label><label><input type="checkbox" v-model="showFormattedLogPush"> show formatted data</label></div><ul><li class="hide-button-container li-result-item" v-for="(log, index) in logsPush"><span class="label label-primary"><relative-time :time="log.timeValue" :locale="locale"></relative-time></span><span class="label label-default">{{log.hostname}}</span><span class="label label-default">{{log.filepath}}</span><pre v-if="log.content && showRawLogPush">{{log.content}}</pre><pre :id="logPushId(index)" v-if="log.formattedContent && showFormattedLogPush && log.visible">{{log.formattedContent}}</pre><button class="btn btn-default btn-sm" :style="visibilityButtonStyle(log)" @click="toggleVisibility(log)" v-if="log.formattedContent && showFormattedLogPush">{{ log.visible ? "hide formatted" : "show formatted" }}</button></li></ul></div>`;
export const realtimeSamplesTemplateHtml = `<div class="panel"><ul class="menu"><li v-for="(config, index) in chartConfigs"><a :href="'#' + config.name">{{config.description}}</a></li></ul><div v-for="(config, index) in chartConfigs"><h4 :id="config.name" style="padding-top: 10px">{{config.description}} {{config.unit !== undefined ? ("(" + config.unit + ")") : ""}} {{config.sum !== undefined ? (" " + config.sum) : ""}}</h4><canvas :id="'current-' + config.name" class="graph" :width="chartWidth" height="300"></canvas></div></div>`;
export const searchLogsTemplateHtml = `<div class="panel"><div class="flex-center"><input class="form-control" v-model="content" title="content" @keyup.enter="search(true)"> <input class="form-control" v-model="time" title="time" @keyup.enter="search(true)"> <input class="form-control" v-model="hostname" titme="hostname" @keyup.enter="search(true)"><button class="btn btn-primary btn-lg primary-button" @click="search(true)" :disabled="!content">search</button></div><div><button class="btn btn-default btn-sm" @click="clearLogsSearchResult()" :disabled="logsSearchResult.length === 0">clear</button><label><input type="checkbox" v-model="showRawLogResult"> show raw data</label><label><input type="checkbox" v-model="showFormattedLogResult"> show formatted data</label></div><ul><li class="li-result-item" v-if="logsSearchResult.length === 0"><pre class="pre">not started or nothing found.</pre></li><li class="hide-button-container li-result-item" v-for="(log, index) in logsSearchResult"><span class="label label-primary"><relative-time :time="log.timeValue" :locale="locale"></relative-time></span><span class="label label-default">{{log.hostname}}</span><span class="label label-default">{{log.filepath}}</span><pre class="pre" v-if="log.content && showRawLogResult" v-html="log.content"></pre><pre class="pre" :id="logSearchResultId(index)" v-if="log.formattedContent && showFormattedLogResult && log.visible" v-html="log.formattedContent"></pre><button class="btn btn-default btn-sm" :style="visibilityButtonStyle(log)" @click="toggleVisibility(log)" v-if="log.formattedContent && showFormattedLogResult">{{ log.visible ? "hide formatted" : "show formatted" }}</button></li></ul><div v-if="logsSearchResult.length > 0 && leftCount > 0"><button class="btn btn-primary" @click="search(false)">continue<span class="badge">{{leftCount}}</span></button></div></div>`;
export const searchSamplesTemplateHtml = `<div class="panel"><div class="flex-center"><input class="form-control" style="width: 30%" v-model="searchFrom"> <input class="form-control" style="width: 30%" v-model="searchTo"><button class="btn btn-primary btn-lg primary-button" @click="searchSamples()" :disabled="!searchFrom || !searchTo">search</button></div><ul class="menu list-unstyled"><li v-for="(config, index) in chartConfigs"><a :href="'#' + config.name">{{config.description}}</a></li></ul><div v-for="(config, index) in chartConfigs"><h4 :id="config.name" style="padding-top: 10px">{{config.description}} {{config.unit !== undefined ? ("(" + config.unit + ")") : ""}}</h4><canvas :id="'history-' + config.name" class="graph" :width="chartWidth" height="300"></canvas></div></div>`;
export const protocolProto = {
    "nested": {
        "protocolPackage": {
            "nested": {
                "Protocol": {
                    "fields": {
                        "kind": {
                            "rule": "required",
                            "type": "string",
                            "id": 1
                        },
                        "requestId": {
                            "type": "uint32",
                            "id": 2
                        },
                        "error": {
                            "type": "string",
                            "id": 3
                        },
                        "serverTime": {
                            "type": "string",
                            "id": 4
                        },
                        "flows": {
                            "rule": "repeated",
                            "type": "Flow",
                            "id": 5
                        },
                        "search": {
                            "type": "Search",
                            "id": 6
                        },
                        "searchResult": {
                            "type": "SearchLogsResult",
                            "id": 7
                        },
                        "historySamples": {
                            "rule": "repeated",
                            "type": "SampleFrame",
                            "id": 8
                        },
                        "searchSamples": {
                            "type": "SearchSamples",
                            "id": 9
                        },
                        "searchSampleResult": {
                            "rule": "repeated",
                            "type": "SampleFrame",
                            "id": 10
                        },
                        "resaveFailedLogsResult": {
                            "type": "ResaveFailedLogsResult",
                            "id": 11
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
                            "id": 4
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
                },
                "Search": {
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
                "SearchLogsResult": {
                    "fields": {
                        "total": {
                            "rule": "required",
                            "type": "uint32",
                            "id": 1
                        },
                        "logs": {
                            "rule": "repeated",
                            "type": "Log",
                            "id": 2
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
                "ResaveFailedLogsResult": {
                    "fields": {
                        "savedCount": {
                            "rule": "required",
                            "type": "uint32",
                            "id": 1
                        },
                        "totalCount": {
                            "rule": "required",
                            "type": "uint32",
                            "id": 2
                        }
                    }
                }
            }
        }
    }
};
export const protocolJson = {
  "title": "Protocol",
  "type": "object",
  "properties": {
    "kind": {
      "type": "string",
      "enum": [
        "flows",
        "search",
        "search result",
        "history samples",
        "resave failed logs",
        "resave failed logs result",
        "search samples",
        "search samples result"
      ]
    },
    "requestId": {
      "type": "integer",
      "minimum": 1,
      "maximum": 4294967295
    },
    "error": {
      "type": "string"
    },
    "serverTime": {
      "type": "string"
    },
    "flows": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/protocolPackage.Flow"
      }
    },
    "search": {
      "$ref": "#/definitions/protocolPackage.Search"
    },
    "searchResult": {
      "$ref": "#/definitions/protocolPackage.SearchLogsResult"
    },
    "historySamples": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/protocolPackage.SampleFrame"
      }
    },
    "searchSamples": {
      "$ref": "#/definitions/protocolPackage.SearchSamples"
    },
    "searchSampleResult": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/protocolPackage.SampleFrame"
      }
    },
    "resaveFailedLogsResult": {
      "$ref": "#/definitions/protocolPackage.ResaveFailedLogsResult"
    }
  },
  "required": [
    "kind"
  ],
  "definitions": {
    "protocolPackage.Log": {
      "title": "Log",
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
      ]
    },
    "protocolPackage.Sample": {
      "title": "Sample",
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
      ]
    },
    "protocolPackage.SampleFrame": {
      "title": "SampleFrame",
      "type": "object",
      "properties": {
        "time": {
          "type": "string"
        },
        "samples": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/protocolPackage.Sample"
          }
        }
      },
      "required": [
        "time",
        "samples"
      ]
    },
    "protocolPackage.Flow": {
      "title": "Flow",
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
          "$ref": "#/definitions/protocolPackage.Log"
        },
        "sample": {
          "$ref": "#/definitions/protocolPackage.Sample"
        }
      },
      "required": [
        "kind"
      ],
      "maxProperties": 2,
      "minProperties": 2
    },
    "protocolPackage.Search": {
      "title": "Search",
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
      ]
    },
    "protocolPackage.SearchLogsResult": {
      "title": "SearchLogsResult",
      "type": "object",
      "properties": {
        "total": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "logs": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/protocolPackage.Log"
          }
        }
      },
      "required": [
        "total",
        "logs"
      ]
    },
    "protocolPackage.SearchSamples": {
      "title": "SearchSamples",
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
      ]
    },
    "protocolPackage.ResaveFailedLogsResult": {
      "title": "ResaveFailedLogsResult",
      "type": "object",
      "properties": {
        "savedCount": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        },
        "totalCount": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4294967295
        }
      },
      "required": [
        "savedCount",
        "totalCount"
      ]
    }
  }
};
// tslint:enable:object-literal-key-quotes trailing-comma
