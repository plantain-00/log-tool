import * as protobuf from "protobufjs";
import * as types from "../src/types";
declare const protobufConfig: { enabled: boolean };

const protofile: string = require("raw!./protocol.proto");
const protocolType = protobuf.parse(protofile).root.lookup("protocolPackage.Protocol") as protobuf.Type;

export function encode(protocol: types.Protocol) {
    if (protobufConfig.enabled) {
        return protocolType.encode(protocol).finish();
    }
    return JSON.stringify(protocol);
}

function blobToUInt8Array(blob: Blob, next: (uint8Array: Uint8Array) => void) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
        next(new Uint8Array(fileReader.result));
    };
    fileReader.readAsArrayBuffer(blob);
}

export function decode(data: any, next: (protocol: types.Protocol) => void) {
    if (typeof data === "string") {
        next(JSON.parse(data));
    } else {
        blobToUInt8Array(data as Blob, uint8Array => {
            next(protocolType.decode(uint8Array).asJSON() as types.Protocol);
        });
    }
}
