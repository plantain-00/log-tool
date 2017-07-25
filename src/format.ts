import * as config from "./config";
import * as libs from "./libs";
import * as types from "./types";

let requestProtocolType: libs.protobuf.Type;
let responsetProtocolType: libs.protobuf.Type;
let flowProtocolType: libs.protobuf.Type;

export function start() {
    (libs.protobuf.load("./static/protocol.proto") as Promise<libs.protobuf.Root>).then(root => {
        requestProtocolType = root.lookup("RequestProtocol") as libs.protobuf.Type;
        responsetProtocolType = root.lookup("ResponseProtocol") as libs.protobuf.Type;
        flowProtocolType = root.lookup("FlowProtocol") as libs.protobuf.Type;
    }, error => {
        libs.publishError(error);
    });
}

export function encodeResponse(protocol: types.ResponseProtocol): string | Uint8Array {
    if (config.protobuf.enabled) {
        return responsetProtocolType.encode(protocol).finish();
    }
    return JSON.stringify(protocol);
}

export function encodeFlow(protocol: types.FlowProtocol): string | Uint8Array {
    if (config.protobuf.enabled) {
        return flowProtocolType.encode(protocol).finish();
    }
    return JSON.stringify(protocol);
}

export function decodeRequest(protocol: ArrayBuffer | string): types.RequestProtocol {
    if (typeof protocol === "string") {
        const result = JSON.parse(protocol);
        const isValidJson = libs.validateRequestProtocol(result);
        if (!isValidJson) {
            throw new Error(libs.validateRequestProtocol.errors![0].message);
        }
        return result;
    }
    return requestProtocolType.toObject(requestProtocolType.decode(new Buffer(protocol))) as types.RequestProtocol;
}

export function decodeFlow(protocol: ArrayBuffer | string): types.FlowProtocol {
    if (typeof protocol === "string") {
        const result = JSON.parse(protocol);
        const isValidJson = libs.validateRequestProtocol(result);
        if (!isValidJson) {
            throw new Error(libs.validateRequestProtocol.errors![0].message);
        }
        return result;
    }
    return flowProtocolType.toObject(flowProtocolType.decode(new Buffer(protocol))) as types.FlowProtocol;
}
