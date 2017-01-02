"use strict";
const configurationFilePath = process.argv[2] || "../log-tool.config.js";
_a = require(configurationFilePath), exports.elastic = _a.elastic, exports.gui = _a.gui, exports.inflow = _a.inflow, exports.outflow = _a.outflow, exports.watcher = _a.watcher, exports.protobuf = _a.protobuf;
var _a;
