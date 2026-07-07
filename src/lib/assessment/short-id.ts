import { randomBytes } from 'node:crypto'

const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'

export function createShortId(length = 8): string {
  const bytes = randomBytes(length)
  let id = ''
  for (let i = 0; i < length; i += 1) {
    id += ALPHABET[bytes[i]! % ALPHABET.length]
  }
  return id
}
