import { describe, it, expect } from "bun:test"
import { encode, decode } from "./serializer"
import type { Envelope, EnvelopeType } from "./types"

describe('Envelope serializer', () => {
  it('should encode and decode an empty discovery envelope', () => {
    const type: EnvelopeType = 'DISCOVERY'
    const envelope: Envelope = { type }

    const buffer = encode(type)
    const decoded = decode(buffer)

    expect(decoded.type).toBe(envelope.type)
    expect(decoded.payload).toBeUndefined()
  })

  it('should encode and decode a heartbeat envelope with payload', () => {
    const type: EnvelopeType = 'HEARTBEAT'
    const payload = new Uint8Array([1, 2, 3, 4])
    const envelope: Envelope = { type, payload }

    const buffer = encode(type, payload)
    const decoded = decode(buffer)

    expect(decoded.type).toBe(envelope.type)
    expect(decoded.payload).toEqual(payload)
  })

  it('should handle multiple envelope types', () => {
    const types: EnvelopeType[] = ['DISCOVERY', 'HEARTBEAT']
    for (const type of types) {
      const buffer = encode(type)
      const decoded = decode(buffer)
      expect(decoded.type).toBe(type)
    }
  })
})