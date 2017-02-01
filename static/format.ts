import * as protobuf from "protobufjs";
import * as Ajv from "ajv";

import * as types from "../src/types";
declare const protobufConfig: { enabled: boolean };

const protofile: string = require("raw-loader!./protocol.proto");
const protocolType = (protobuf.parse(protofile)["root"] as protobuf.Root).lookup("protocolPackage.Protocol") as protobuf.Type;

const ajv = new Ajv();
const jsonSchema = require("raw-loader!./protocol.json");
const validate = ajv.compile(JSON.parse(jsonSchema));

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
        const result = JSON.parse(data);
        const isValidJson = validate(result);
        if (!isValidJson) {
            console.log(validate.errors![0].message);
        } else {
            next(result);
        }
    } else {
        next(protocolType.decode(new Uint8Array(data)).toObject() as types.Protocol);
    }
}
