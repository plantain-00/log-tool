import * as config from "./config";
import * as libs from "./libs";
import * as types from "./types";

let protocolType: libs.protobuf.Type;

export function start() {
    (libs.protobuf.load("./static/protocol.proto") as Promise<libs.protobuf.Root>).then(root => {
        protocolType = root.lookup("protocolPackage.Protocol") as libs.protobuf.Type;
    }, error => {
        libs.publishError(error);
    });
}

export function encode(protocol: types.Protocol): string | Uint8Array {
    if (config.protobuf.enabled) {
        return protocolType.encode(protocol).finish();
    }
    return JSON.stringify(protocol);
}

export function decode(protocol: ArrayBuffer | string): types.Protocol {
    if (typeof protocol === "string") {
        const result = JSON.parse(protocol);
        const isValidJson = libs.validate(result);
        if (!isValidJson) {
            throw new Error(libs.validate.errors![0].message);
        }
        return result;
    }
    return protocolType.decode(new Buffer(protocol)).toJSON() as types.Protocol;
}
