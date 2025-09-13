import { createHash } from 'node:crypto'
import type { Key } from './types'

export const getHash = (items: Key[], algorithm = 'sha256') => {
  const hash = createHash(algorithm)

  for (const item of items) {
    if (typeof item === 'number') hash.update(String(item))
    else hash.update(item)
  }

  // See https://en.wikipedia.org/wiki/Base64#Filenames
  return hash.digest('base64').replace(/\//g, '-')
}
