import * as protobuf from "protobufjs";
import * as types from "../src/types";
declare const protobufConfig: { enabled: boolean };

const protofile: string = require("raw!./protocol.proto");
const protocolType = (protobuf.parse(protofile)["root"] as protobuf.Root).lookup("protocolPackage.Protocol") as protobuf.Type;

export function encode(protocol: types.Protocol): string | Uint8Array {
    if (protobufConfig.enabled) {
        return protocolType.encode(protocol).finish();
    }
    return JSON.stringify(protocol);
}

// function blobToUInt8Array(blob: Blob, next: (uint8Array: Uint8Array) => void) {
//     const fileReader = new FileReader();
//     fileReader.onload = () => {
//         next(new Uint8Array(fileReader.result as ArrayBuffer));
//     };
//     fileReader.readAsArrayBuffer(blob);
// }

export function decode(data: string | ArrayBuffer, next: (protocol: types.Protocol) => void) {
    if (typeof data === "string") {
        next(JSON.parse(data));
    } else {
        next(protocolType.decode(new Uint8Array(data)).asJSON() as types.Protocol);
    }
}
