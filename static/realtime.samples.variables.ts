/**
 * This file is generated by 'file2variable-cli'
 * It is not mean to be edited by hand
 */
// tslint:disable
import { RealtimeSamples } from "./index";

// @ts-ignore
export function realtimeSamplesTemplateHtml(this: RealtimeSamples) {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"panel"},[_c('ul',{staticClass:"menu"},_vm._l((_vm.chartConfigs),function(config,index){return _c('li',{key:config.name},[_c('a',{attrs:{"href":"javascript:void(0)"},on:{"click":function($event){_vm.scrollBy(config.name)}}},[_vm._v(_vm._s(config.description))])])})),_vm._l((_vm.chartConfigs),function(config,index){return _c('div',{key:config.name},[_c('h4',{staticStyle:{"padding-top":"10px"}},[_vm._v(_vm._s(config.description)+" "+_vm._s(config.unit !== undefined ? ("(" + config.unit + ")") : "")+" "+_vm._s(config.sum !== undefined ? (" " + config.sum) : ""))]),_c('canvas',{staticClass:"graph",attrs:{"id":'current-' + config.name,"width":_vm.chartWidth,"height":"300"}})])})],2)}
// @ts-ignore
export var realtimeSamplesTemplateHtmlStatic = [  ]
// tslint:enable
