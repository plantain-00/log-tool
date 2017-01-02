"use strict";
const config = require("./config");
const libs = require("./libs");
let protocolType;
function start() {
    libs.protobuf.load("./static/protocol.proto").then(root => {
        protocolType = root.lookup("protocolPackage.Protocol");
    }, error => {
        libs.errorSubject.next(error);
    });
}
exports.start = start;
function encode(protocol) {
    if (config.protobuf.enabled) {
        return protocolType.encode(protocol).finish();
    }
    return JSON.stringify(protocol);
}
exports.encode = encode;
function decode(protocol) {
    if (typeof protocol === "string") {
        return JSON.parse(protocol);
    }
    return protocolType.decode(new Buffer(protocol)).asJSON();
}
exports.decode = decode;
