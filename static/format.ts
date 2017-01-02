import * as protobuf from "protobufjs";
import * as types from "../src/types";
declare const protobufConfig: { enabled: boolean };

let protocolType: protobuf.Type;

export function loadProtobuf(next: () => void) {
    protobuf.load("./protocol.proto", (error: Error, root: protobuf.Root) => {
        if (error) {
            console.log(error);
        } else {
            protocolType = root.lookup("protocolPackage.Protocol") as protobuf.Type;
        }
        next();
    });
};

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
