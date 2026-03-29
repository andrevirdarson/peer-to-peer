import type { Envelope, EnvelopeType } from "./types"
import { encode as msgpackEncode, decode as msgpackDecode } from "@msgpack/msgpack"

export function encode<T>(type: EnvelopeType, payload?: T): Uint8Array {
    return msgpackEncode({ type, payload })
}

export function decode(buffer: Buffer): Envelope<unknown> {
    return msgpackDecode(buffer) as Envelope<unknown>
}