import * as config from "./config";
import * as libs from "./libs";
import * as types from "./types";

let protocolType: libs.protobuf.Type;

export function start() {
    (libs.protobuf.load("./static/protocol.proto") as Promise<libs.protobuf.Root>).then(root => {
        protocolType = root.lookup("protocolPackage.Protocol") as libs.protobuf.Type;
    }, error => {
        libs.errorSubject.next(error);
    });
}

export function encode(protocol: types.Protocol) {
    if (config.protobuf.enabled) {
        return protocolType.encode(protocol).finish();
    }
    return JSON.stringify(protocol);
}

export function decode(protocol: ArrayBuffer | string): types.Protocol {
    if (typeof protocol === "string") {
        return JSON.parse(protocol);
    }
    return protocolType.decode(new Buffer(protocol)).asJSON() as types.Protocol;
}
