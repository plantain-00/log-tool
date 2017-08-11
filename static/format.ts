import * as protobuf from "protobufjs";
import * as Ajv from "ajv";

import * as types from "../src/types";
import { defaultConfig } from "./config";
import { protocolProto, responseProtocolJson, requestProtocolJson } from "./variables";

const root = protobuf.Root.fromJSON(protocolProto);
const RequestProtocolType = root.lookup("RequestProtocol") as protobuf.Type;
const ResponseProtocolType = root.lookup("ResponseProtocol") as protobuf.Type;

const ajv = new Ajv();
const validateRequestProtocol = ajv.compile(requestProtocolJson);
const validateResponseProtocol = ajv.compile(responseProtocolJson);

export function encodeRequest(protocol: types.RequestProtocol): string | Uint8Array | undefined {
    if (defaultConfig.protobuf.enabled) {
        return RequestProtocolType.encode(protocol).finish();
    }
    const isValidJson = validateRequestProtocol(protocol);
    if (!isValidJson) {
        // tslint:disable-next-line:no-console
        console.log(validateRequestProtocol.errors![0].message);
        return undefined;
    } else {
        return JSON.stringify(protocol);
    }
}

// function blobToUInt8Array(blob: Blob, next: (uint8Array: Uint8Array) => void) {
//     const fileReader = new FileReader();
//     fileReader.onload = () => {
//         next(new Uint8Array(fileReader.result as ArrayBuffer));
//     };
//     fileReader.readAsArrayBuffer(blob);
// }

export function decodeResponse(data: string | ArrayBuffer, next: (protocol: types.ResponseProtocol) => void) {
    if (typeof data === "string") {
        const result = JSON.parse(data);
        const isValidJson = validateResponseProtocol(result);
        if (!isValidJson) {
            // tslint:disable-next-line:no-console
            console.log(validateResponseProtocol.errors![0].message);
        } else {
            next(result);
        }
    } else {
        next(ResponseProtocolType.toObject(ResponseProtocolType.decode(new Uint8Array(data))) as types.ResponseProtocol);
    }
}
