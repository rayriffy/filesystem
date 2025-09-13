import { join } from 'node:path'
import type { Option } from './types'

export const defaultOptions: Option = {
  enabled: true,
  cacheAlgorithm: 'sha256',
  cacheDirectory: join(process.cwd(), '.cache'),
}
