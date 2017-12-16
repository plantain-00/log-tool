/**
 * This file is generated by 'file2variable-cli'
 * It is not mean to be edited by hand
 */
// tslint:disable
import { SearchLogs } from "./index";

// @ts-ignore
export function searchLogsTemplateHtml(this: SearchLogs) {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"panel"},[_c('div',{staticClass:"flex-center"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.content),expression:"content"}],staticClass:"form-control",attrs:{"title":"content"},domProps:{"value":(_vm.content)},on:{"keyup":function($event){if(!('button' in $event)&&_vm._k($event.keyCode,"enter",13,$event.key)){ return null; }_vm.search(true)},"input":function($event){if($event.target.composing){ return; }_vm.content=$event.target.value}}}),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.time),expression:"time"}],staticClass:"form-control",attrs:{"title":"time"},domProps:{"value":(_vm.time)},on:{"keyup":function($event){if(!('button' in $event)&&_vm._k($event.keyCode,"enter",13,$event.key)){ return null; }_vm.search(true)},"input":function($event){if($event.target.composing){ return; }_vm.time=$event.target.value}}}),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.hostname),expression:"hostname"}],staticClass:"form-control",attrs:{"titme":"hostname"},domProps:{"value":(_vm.hostname)},on:{"keyup":function($event){if(!('button' in $event)&&_vm._k($event.keyCode,"enter",13,$event.key)){ return null; }_vm.search(true)},"input":function($event){if($event.target.composing){ return; }_vm.hostname=$event.target.value}}}),_c('button',{staticClass:"btn btn-primary btn-lg primary-button",attrs:{"disabled":!_vm.content},on:{"click":function($event){_vm.search(true)}}},[_vm._v("search")])]),_c('div',[_c('button',{staticClass:"btn btn-default btn-sm",attrs:{"disabled":_vm.logsSearchResult.length === 0},on:{"click":function($event){_vm.clearLogsSearchResult()}}},[_vm._v("clear")]),_c('label',[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.showRawLogResult),expression:"showRawLogResult"}],attrs:{"type":"checkbox"},domProps:{"checked":Array.isArray(_vm.showRawLogResult)?_vm._i(_vm.showRawLogResult,null)>-1:(_vm.showRawLogResult)},on:{"change":function($event){var $$a=_vm.showRawLogResult,$$el=$event.target,$$c=$$el.checked?(true):(false);if(Array.isArray($$a)){var $$v=null,$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.showRawLogResult=$$a.concat([$$v]))}else{$$i>-1&&(_vm.showRawLogResult=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}}else{_vm.showRawLogResult=$$c}}}}),_vm._v(" show raw data")]),_c('label',[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.showFormattedLogResult),expression:"showFormattedLogResult"}],attrs:{"type":"checkbox"},domProps:{"checked":Array.isArray(_vm.showFormattedLogResult)?_vm._i(_vm.showFormattedLogResult,null)>-1:(_vm.showFormattedLogResult)},on:{"change":function($event){var $$a=_vm.showFormattedLogResult,$$el=$event.target,$$c=$$el.checked?(true):(false);if(Array.isArray($$a)){var $$v=null,$$i=_vm._i($$a,$$v);if($$el.checked){$$i<0&&(_vm.showFormattedLogResult=$$a.concat([$$v]))}else{$$i>-1&&(_vm.showFormattedLogResult=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}}else{_vm.showFormattedLogResult=$$c}}}}),_vm._v(" show formatted data")])]),_c('ul',[(_vm.logsSearchResult.length === 0)?_c('li',{staticClass:"li-result-item"},[_c('pre',{staticClass:"pre"},[_vm._v("not started or nothing found.")])]):_vm._e(),_vm._l((_vm.logsSearchResult),function(log,index){return _c('li',{key:index,staticClass:"hide-button-container li-result-item"},[_c('span',{staticClass:"label label-primary"},[_c('relative-time',{attrs:{"time":log.timeValue,"locale":_vm.locale}})],1),_c('span',{staticClass:"label label-default"},[_vm._v(_vm._s(log.hostname))]),_c('span',{staticClass:"label label-default"},[_vm._v(_vm._s(log.filepath))]),(log.content && _vm.showRawLogResult)?_c('pre',{staticClass:"pre",domProps:{"innerHTML":_vm._s(log.content)}}):_vm._e(),(log.formattedContent && _vm.showFormattedLogResult && log.visible)?_c('pre',{staticClass:"pre",attrs:{"id":_vm.logSearchResultId(index)},domProps:{"innerHTML":_vm._s(log.formattedContent)}}):_vm._e(),(log.formattedContent && _vm.showFormattedLogResult)?_c('button',{staticClass:"btn btn-default btn-sm",style:(_vm.visibilityButtonStyle(log)),on:{"click":function($event){_vm.toggleVisibility(log)}}},[_vm._v(_vm._s(log.visible ? "hide formatted" : "show formatted"))]):_vm._e()])})],2),(_vm.logsSearchResult.length > 0 && _vm.leftCount > 0)?_c('div',[_c('button',{staticClass:"btn btn-primary",on:{"click":function($event){_vm.search(false)}}},[_vm._v("continue"),_c('span',{staticClass:"badge"},[_vm._v(_vm._s(_vm.leftCount))])])]):_vm._e()])}
// @ts-ignore
export var searchLogsTemplateHtmlStatic = [  ]
// tslint:enable
