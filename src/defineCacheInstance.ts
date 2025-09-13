import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { defaultOptions } from './defaultOptions'
import { getHash } from './getHash'

import type { Key, Option } from './types'

export const defineCacheInstance = (instanceOptions?: Partial<Option>) => {
  const baseOptions = { ...defaultOptions, ...instanceOptions }

  const write = async <T = unknown>(
    key: Key[],
    content: T,
    maxAgeInMs = 60 * 1000,
    functionOptions?: Partial<Option>
  ) => {
    const options = { ...baseOptions, ...functionOptions }
    if (!options.enabled) return null

    const hash = getHash(key)
    const requestedDirectory = join(options.cacheDirectory, hash)

    const stringifiedContent = JSON.stringify(content)
    const etag = getHash([stringifiedContent])
    const targetFileName = `${maxAgeInMs}.${maxAgeInMs + Date.now()}.${etag}.json`

    try {
      await mkdir(requestedDirectory, { recursive: true })
      await writeFile(
        join(requestedDirectory, targetFileName),
        stringifiedContent
      )

      return {
        etag,
        data: content,
      }
    } catch (e) {
      console.error(`failed to write [${key.join(', ')}] to filesystem`)
      await rm(join(requestedDirectory, targetFileName)).catch(() => {})
      return null
    }
  }

  const read = async <T = unknown>(key: Key[], functionOptions?: Partial<Option>) => {
    const options = { ...baseOptions, ...functionOptions }
    if (!options.enabled) return null

    const hash = getHash(key)
    const requestedDirectory = join(options.cacheDirectory, hash)

    try {
      const now = Date.now()
      const files = await readdir(requestedDirectory)

      for (const file of files) {
        const [_maxAgeString, expireAtString, etag, _extension] =
          file.split('.')
        const filePath = join(requestedDirectory, file)
        const expireAt = Number(expireAtString)

        if (expireAt < now) {
          await rm(filePath)
        } else {
          const cachedMarkdownResponse = await readFile(
            join(requestedDirectory, file),
            'utf8'
          ).then(o => JSON.parse(o) as T)

          return {
            etag,
            data: cachedMarkdownResponse,
          }
        }
      }
    } catch (e) {}
    return null
  }

  const remove = async (key: Key[], functionOptions?: Partial<Option>) => {
    const options = { ...baseOptions, ...functionOptions }
    if (!options.enabled) return

    const hash = getHash(key)
    const requestedDirectory = join(options.cacheDirectory, hash)

    try {
      await rm(requestedDirectory, {
        recursive: true,
      })
    } catch (e) {}
  }

  return {
    write,
    read,
    remove,
  }
}
