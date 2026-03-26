import { MESSAGE_TYPE, type Envelope, type EnvelopeType } from "./types"

export const HEADER = {
    TOTAL_SIZE: 3,
    TYPE_OFFSET: 0,
    PAYLOAD_LENGTH_OFFSET: 1,
} as const

export function encode(type: EnvelopeType, payload?: Uint8Array): Buffer {
    const payloadBytes = payload ? Buffer.from(payload) : Buffer.alloc(0)

    const buffer = Buffer.alloc(HEADER.TOTAL_SIZE + payloadBytes.length)

    const typeByte = MESSAGE_TYPE[type]
    buffer.writeUInt8(typeByte, HEADER.TYPE_OFFSET)
    buffer.writeUInt16BE(payloadBytes.length, HEADER.PAYLOAD_LENGTH_OFFSET)
    payloadBytes.copy(buffer, HEADER.TOTAL_SIZE)

    return buffer;
}

export function decode(buffer: Buffer): Envelope {
    const typeByte = buffer.readUint8(HEADER.TYPE_OFFSET)
    const payloadLength = buffer.readUInt16BE(HEADER.PAYLOAD_LENGTH_OFFSET)

    const typeEntry = Object.entries(MESSAGE_TYPE).find(([_, value]) => value === typeByte);
    if (!typeEntry) throw new Error(`Unknown message type: ${typeByte}`)
    const type = typeEntry[0] as EnvelopeType

    const payloadBytes = buffer.subarray(HEADER.TOTAL_SIZE, HEADER.TOTAL_SIZE + payloadLength)
    const payload = payloadBytes.length > 0 ? payloadBytes : undefined

    return { type, payload }
}