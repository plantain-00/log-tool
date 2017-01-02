webpackJsonp([0],[function(e,t,a){"use strict";function n(e,t,a){if(e){var n=e.getBoundingClientRect();t.visibilityButtonExtraBottom=n.top<a-40&&n.top+n.height>a?n.top+n.height-a:0}}for(var s,o=a(1),l=a(2),i=a(3),r=a(5),c=a(7),d=0,u=chartConfigs;d<u.length;d++){var h=u[d];h.sum=void 0}var g='time:["1970-01-01 00:00:00" TO *]\nAND hostname:*\nAND filepath:*\nAND *',p=function(e){function t(){var t=e.apply(this,arguments)||this;return t.tabIndex=0,t.logsSearchResult=[],t.logsSearchResultCount=0,t.logsPush=[],t.errorsPush=[],t.q=g,t.from=0,t.size=10,t.newLogsCount=0,t.newErrorsCount=0,t.showRawLogResult=!1,t.showFormattedLogResult=!0,t.showRawLogPush=!1,t.showFormattedLogPush=!0,t.chartConfigs=chartConfigs,t.chartWidth=0,t}return __extends(t,e),Object.defineProperty(t.prototype,"leftCount",{get:function(){return this.logsSearchResultCount-this.from-this.size},enumerable:!0,configurable:!0}),t.prototype.visibilityButtonStyle=function(e){return{position:"absolute",bottom:(e.visible?10+e.visibilityButtonExtraBottom:0)+"px",right:"10px"}},t.prototype.logSearchResultId=function(e){return"log-search-result-"+e},t.prototype.logPushId=function(e){return"log-push-"+e},t.prototype.errorPushId=function(e){return"error-push-"+e},t.prototype.tab=function(e){this.tabIndex=e,1===this.tabIndex?this.newLogsCount=0:2===this.tabIndex&&(this.newErrorsCount=0)},t.prototype.clearLogsSearchResult=function(){this.logsSearchResult=[]},t.prototype.clearLogsPush=function(){this.logsPush=[]},t.prototype.clearErrorsPush=function(){this.errorsPush=[]},t.prototype.search=function(e){if(e?(this.from=0,this.logsSearchResult=[],this.logsSearchResultCount=0):this.from+=this.size,s){var t={kind:"search",search:{q:this.q,from:this.from,size:this.size}};s.send(c.encode(t))}},t.prototype.toggleVisibility=function(e){e.visible=!e.visible},t}(o);p=__decorate([l.default({template:a(17)})],p);var v=new p({el:"#body"}),m="https:"===location.protocol?"wss:":"ws:",b=new i.Reconnector(function(){s=new WebSocket(m+"//"+location.host),s.binaryType="arraybuffer",s.onmessage=function(e){c.decode(e.data,function(e){if("search result"===e.kind)if(e.searchResult&&e.searchResult.logs){for(var t=0,a=e.searchResult.logs;t<a.length;t++){var n=a[t],s=n;try{s.visible=!0,s.visibilityButtonExtraBottom=0,s.formattedContent=JSON.stringify(JSON.parse(n.content),null,"  ")}catch(e){console.log(e)}v.logsSearchResult.push(s)}v.logsSearchResultCount=e.searchResult.total}else v.logsSearchResult=[],v.logsSearchResultCount=0;else if("flows"===e.kind){for(var o=[],l=0,i=e.flows;l<i.length;l++){var c=i[l];if("log"===c.kind){var s=c.log;try{s.visible=!0,s.visibilityButtonExtraBottom=0,s.formattedContent=JSON.stringify(JSON.parse(s.content),null,"  ")}catch(e){console.log(e)}v.logsPush.unshift(s),v.newLogsCount++}else if("error"===c.kind){var d=c.error;d.visible=!0,d.visibilityButtonExtraBottom=0,v.errorsPush.unshift(c.error),v.newErrorsCount++}else"sample"===c.kind&&o.push(c.sample)}o.length>0&&r.appendChartData({time:e.serverTime,samples:o}),r.trimHistory(v.logsPush),r.trimHistory(v.errorsPush)}else if("history samples"===e.kind){void 0===e.historySamples&&(e.historySamples=[]),r.initializeCharts();for(var u=0,h=e.historySamples;u<h.length;u++){var g=h[u];r.appendChartData(g)}}})},s.onclose=function(){b.reconnect()},s.onopen=function(){b.reset()}});window.onscroll=function(){for(var e=window.innerHeight||document.documentElement.clientHeight,t=0;t<v.logsSearchResult.length;t++){var a=v.logsSearchResult[t],s=document.getElementById(v.logSearchResultId(t));n(s,a,e)}for(var t=0;t<v.logsPush.length;t++){var a=v.logsPush[t],s=document.getElementById(v.logPushId(t));n(s,a,e)}for(var t=0;t<v.errorsPush.length;t++){var o=v.errorsPush[t],s=document.getElementById(v.errorPushId(t));n(s,o,e)}},v.chartWidth=document.getElementById("tab-content").getBoundingClientRect().width-30,setInterval(function(){r.updateCharts()},1e3)},,,,,function(e,t,a){"use strict";function n(e,t){for(var a=0,n=e;a<n.length;a++){var s=n[a];if(t(s))return s}}function s(e){if(e.willSum){for(var t=0,a=0,n=u[e.name].datasets;a<n.length;a++)for(var s=n[a],o=0,l=s.data;o<l.length;o++){var i=l[o];t+=i}e.sum=t}else e.sum=void 0}function o(e){e.length>m&&e.splice(0,e.length-m)}function l(e){for(var t=e.time.split(" ")[1],a=0,s=chartConfigs;a<s.length;a++){var l=s[a];h[l.name].labels.push(t);for(var i=function(e){var t=e.hostname+":"+e.port,a=l.compute?l.compute(e.values):e.values[l.name],s=n(h[l.name].datasets,function(e){return e.label===t});if(s)s.data.push(a);else{for(var o=u[l.name].labels.length+h[l.name].labels.length-1,i=[],r=0;r<o;r++)i.push(0);i.push(a);var c=d.getColor(t);h[l.name].datasets.push({label:t,data:i,borderColor:c,backgroundColor:c})}},r=0,c=e.samples;r<c.length;r++){var g=c[r];i(g)}for(var p=function(t){e.samples.every(function(e){return e.hostname+":"+e.port!==t.label})&&t.data.push(0)},v=0,m=h[l.name].datasets;v<m.length;v++){var b=m[v];p(b)}o(h[l.name].labels);for(var f=0,y=h[l.name].datasets;f<y.length;f++){var b=y[f];o(b.data)}}}function i(e){var t=e.getBoundingClientRect();return t.bottom>0&&t.right>0&&t.left<(window.innerWidth||document.documentElement.clientWidth)&&t.top<(window.innerHeight||document.documentElement.clientHeight)}function r(){for(var e=0,t=chartConfigs;e<t.length;e++){var a=t[e],n=i(v[a.name]);if(n&&g!==a.name){var l=h[a.name].labels.length>0;if(l){(f=u[a.name].labels).push.apply(f,h[a.name].labels),h[a.name].labels=[];for(var r=h[a.name].datasets,c=0;c<r.length;c++)c>=u[a.name].datasets.length?u[a.name].datasets.push(JSON.parse(JSON.stringify(r[c]))):(y=u[a.name].datasets[c].data).push.apply(y,r[c].data),r[c].data=[]}o(u[a.name].labels);for(var d=0,m=u[a.name].datasets;d<m.length;d++){var b=m[d];o(b.data)}s(a),l&&p[a.name].update()}}var f,y}function c(){for(var e=function(e){var t=document.getElementById("current-"+e.name);t.onmouseover=function(){g=e.name},t.onmouseout=function(){g=void 0},v[e.name]=t;var a=t.getContext("2d");p[e.name]=new Chart(a,{type:"line",data:u[e.name],options:{responsive:!1,animation:{duration:0},elements:{line:{borderWidth:0},point:{radius:0}},scales:{xAxes:[{type:"time",time:{format:"HH:mm:ss",tooltipFormat:"HH:mm:ss"},scaleLabel:{display:!0,labelString:"time"}}],yAxes:[{stacked:!0,scaleLabel:{display:!0}}]}}})},t=0,a=chartConfigs;t<a.length;t++){var n=a[t];e(n)}}for(var d=a(6),u={},h={},g=void 0,p={},v={},m=300,b=0,f=chartConfigs;b<f.length;b++){var y=f[b];u[y.name]={labels:[],datasets:[]},h[y.name]={labels:[],datasets:[]}}t.trimHistory=o,t.appendChartData=l,t.updateCharts=r,t.initializeCharts=c},function(e,t){"use strict";function a(e){var t=s[e];if(t)return t;var a=Object.keys(s).length%n.length;return s[e]=n[a],n[a]}var n=["#4BC0C0","#FFA6B8","#36A2EB","#FFCE56","#979D91","#A71D1D","#714096","#8CCB2A","#ED8618","#6B720C"],s={};t.getColor=a},function(e,t,a){"use strict";function n(e){return protobufConfig.enabled?i.encode(e).finish():JSON.stringify(e)}function s(e,t){t("string"==typeof e?JSON.parse(e):i.decode(new Uint8Array(e)).asJSON())}var o=a(8),l=a(16),i=o.parse(l).root.lookup("protocolPackage.Protocol");t.encode=n,t.decode=s},,,,,,,,,function(e,t){e.exports='package protocolPackage;\n\nsyntax = "proto3";\n\nmessage Protocol {\n    required string kind = 1;\n    optional string serverTime = 2;\n    repeated Flow flows = 3;\n    optional Search search = 4;\n    optional SearchLogsResult searchResult = 5;\n    repeated SampleFrame historySamples = 6;\n}\n\nmessage Flow {\n    required string kind = 1;\n    optional Log log = 2;\n    optional ErrorWithTime error = 3;\n    optional Sample sample = 4;\n}\n\nmessage Log {\n    required string time = 1;\n    required string content = 2;\n    required string filepath = 3;\n    required string hostname = 4;\n}\n\nmessage ErrorWithTime {\n    required string time = 1;\n    required string error = 2;\n}\n\nmessage Sample {\n    required string hostname = 1;\n    required int32 port = 2;\n    map<string, int32> values = 3;\n}\n\nmessage Search {\n    required string q = 1;\n    required int32 from = 2;\n    required int32 size = 3;\n}\n\nmessage SearchLogsResult {\n    required int32 total = 1;\n    repeated Log logs = 2;\n}\n\nmessage SampleFrame {\n    required string time = 1;\n    repeated Sample samples = 2;\n}\n'},function(e,t){e.exports='<div class="container"><div class="row"><div class="col-md-12"><h4>Log Tool</h4></div><div class="col-md-12"><ul class="nav nav-tabs" role="tablist"><li role="presentation" :class="tabIndex === 0 ? \'active\' : \'\'" @click="tab(0)"><a href="javascript:void(0)" role="tab" data-toggle="tab">Search Logs</a></li><li role="presentation" :class="tabIndex === 1 ? \'active\' : \'\'" @click="tab(1)"><a href="javascript:void(0)" role="tab" data-toggle="tab">Realtime Logs <span class="badge" v-if="newLogsCount > 0">{{newLogsCount}}</span></a></li><li role="presentation" :class="tabIndex === 2 ? \'active\' : \'\'" @click="tab(2)"><a href="javascript:void(0)" role="tab" data-toggle="tab">Realtime Errors <span class="badge" v-if="newErrorsCount > 0">{{newErrorsCount}}</span></a></li><li role="presentation" :class="tabIndex === 3 ? \'active\' : \'\'" @click="tab(3)"><a href="javascript:void(0)" role="tab" data-toggle="tab">Samples</a></li></ul></div><div class="col-md-12"><div id="tab-content" class="tab-content"><div role="tabpanel" :class="tabIndex === 0 ? \'tab-pane active\' : \'tab-pane\'"><div class="panel panel-default"><div class="panel-body"><div class="row flex-center"><div class="col-md-10"><textarea class="form-control" v-model="q" @keyup.enter="search(true)" rows="5"></textarea></div><div class="col-md-2"><button class="btn btn-primary btn-lg primary-button" @click="search(true)" :disabled="!q">search</button></div></div><div class="row"><div class="col-md-12"><button class="btn btn-default btn-sm" @click="clearLogsSearchResult()" :disabled="logsSearchResult.length === 0">clear</button><label><input type="checkbox" v-model="showRawLogResult"> show raw data</label><label><input type="checkbox" v-model="showFormattedLogResult"> show formatted data</label></div></div><div class="row"><ul class="col-md-12"><li class="li-result-item" v-if="logsSearchResult.length === 0"><pre>not started or nothing found.</pre></li><li class="hide-button-container li-result-item" v-for="(log, index) in logsSearchResult"><span class="label label-primary">{{log.time}}</span> <span class="label label-default">{{log.hostname}}</span> <span class="label label-default">{{log.filepath}}</span><pre v-if="log.content && showRawLogResult">{{log.content}}</pre><pre :id="logSearchResultId(index)" v-if="log.formattedContent && showFormattedLogResult && log.visible">{{log.formattedContent}}</pre><button class="btn btn-default btn-sm" :style="visibilityButtonStyle(log)" @click="toggleVisibility(log)">{{ log.visible ? "hide" : "show" }}</button></li></ul></div><div class="row" v-if="logsSearchResult.length > 0 && leftCount > 0"><div class="col-md-12"><button class="btn btn-primary" @click="search(false)">continue <span class="badge">{{leftCount}}</span></button></div></div></div></div></div><div role="tabpanel" :class="tabIndex === 1 ? \'tab-pane active\' : \'tab-pane\'"><div class="panel panel-default"><div class="panel-body"><div class="row"><div class="col-md-12"><button class="btn btn-default btn-sm" @click="clearLogsPush()" :disabled="logsPush.length === 0">clear</button><label><input type="checkbox" v-model="showRawLogPush"> show raw data</label><label><input type="checkbox" v-model="showFormattedLogPush"> show formatted data</label></div></div><div class="row"><ul class="col-md-12"><li class="hide-button-container li-result-item" v-for="(log, index) in logsPush"><span class="label label-primary">{{log.time}}</span> <span class="label label-default">{{log.hostname}}</span> <span class="label label-default">{{log.filepath}}</span><pre v-if="log.content && showRawLogPush">{{log.content}}</pre><pre :id="logPushId(index)" v-if="log.formattedContent && showFormattedLogPush && log.visible">{{log.formattedContent}}</pre><button class="btn btn-default btn-sm" :style="visibilityButtonStyle(log)" @click="toggleVisibility(log)">{{ log.visible ? "hide" : "show" }}</button></li></ul></div></div></div></div><div role="tabpanel" :class="tabIndex === 2 ? \'tab-pane active\' : \'tab-pane\'"><div class="panel panel-default"><div class="panel-body"><div class="row"><div class="col-md-12"><button class="btn btn-default btn-sm" @click="clearErrorsPush()" :disabled="errorsPush.length === 0">clear</button></div></div><div class="row"><ul class="col-md-12"><li class="hide-button-container li-result-item" v-for="(error, index) in errorsPush"><span class="label label-default">{{error.time}}</span><pre :id="errorPushId(index)" v-if="error.visible">{{error.error}}</pre><button class="btn btn-default btn-sm" :style="visibilityButtonStyle(error)" @click="toggleVisibility(error)">{{ error.visible ? "hide" : "show" }}</button></li></ul></div></div></div></div><div role="tabpanel" :class="tabIndex === 3 ? \'tab-pane active\' : \'tab-pane\'"><div class="panel panel-default"><div class="panel-body"><ul class="menu list-unstyled"><li v-for="(config, index) in chartConfigs"><a :href="\'#\' + config.name">{{config.description}}</a></li></ul><div class="row" v-for="(config, index) in chartConfigs"><div class="col-md-12"><h4 :id="config.name" style="padding-top: 10px">{{config.description}} {{config.unit !== undefined ? ("(" + config.unit + ")") : ""}} {{config.sum !== undefined ? (" " + config.sum) : ""}}</h4><canvas :id="\'current-\' + config.name" class="graph" :width="chartWidth" height="300"></canvas></div></div></div></div></div></div></div></div></div>'}]);