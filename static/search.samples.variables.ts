/**
 * This file is generated by 'file2variable-cli'
 * It is not mean to be edited by hand
 */
// tslint:disable
import { SearchSamples } from "./index";

// @ts-ignore
export function searchSamplesTemplateHtml(this: SearchSamples) {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"panel"},[_c('div',{staticClass:"flex-center"},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.searchFrom),expression:"searchFrom"}],staticClass:"form-control",staticStyle:{"width":"30%"},domProps:{"value":(_vm.searchFrom)},on:{"input":function($event){if($event.target.composing){ return; }_vm.searchFrom=$event.target.value}}}),_vm._v(" "),_c('input',{directives:[{name:"model",rawName:"v-model",value:(_vm.searchTo),expression:"searchTo"}],staticClass:"form-control",staticStyle:{"width":"30%"},domProps:{"value":(_vm.searchTo)},on:{"input":function($event){if($event.target.composing){ return; }_vm.searchTo=$event.target.value}}}),_c('button',{staticClass:"btn btn-primary btn-lg primary-button",attrs:{"disabled":!_vm.searchFrom || !_vm.searchTo},on:{"click":function($event){_vm.searchSamples()}}},[_vm._v("search")])]),_c('ul',{staticClass:"menu list-unstyled"},_vm._l((_vm.chartConfigs),function(config,index){return _c('li',{key:config.name},[_c('a',{attrs:{"href":'#' + config.name}},[_vm._v(_vm._s(config.description))])])})),_vm._l((_vm.chartConfigs),function(config,index){return _c('div',{key:config.name},[_c('h4',{staticStyle:{"padding-top":"10px"},attrs:{"id":config.name}},[_vm._v(_vm._s(config.description)+" "+_vm._s(config.unit !== undefined ? ("(" + config.unit + ")") : ""))]),_c('canvas',{staticClass:"graph",attrs:{"id":'history-' + config.name,"width":_vm.chartWidth,"height":"300"}})])})],2)}
// @ts-ignore
export var searchSamplesTemplateHtmlStatic = [  ]
// tslint:enable
