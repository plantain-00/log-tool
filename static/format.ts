import * as protobuf from "protobufjs";
import * as Ajv from "ajv";

import * as types from "../src/types";
declare const protobufConfig: { enabled: boolean };
import { staticProtocolProto, staticProtocolJson } from "./variables";

const protocolType = protobuf.Root.fromJSON(staticProtocolProto).lookup("protocolPackage.Protocol") as protobuf.Type;

const ajv = new Ajv();
const validate = ajv.compile(staticProtocolJson);

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
            // tslint:disable-next-line:no-console
            console.log(validate.errors![0].message);
        } else {
            next(result);
        }
    } else {
        next(protocolType.decode(new Uint8Array(data)).toObject() as types.Protocol);
    }
}
