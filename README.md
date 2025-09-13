# @rayriffy/filesystem

A simple, efficient filesystem-based caching library for Node.js with TTL (time-to-live) support and automatic cleanup.

## Features

- 🚀 **Simple API** - Easy to use with just `write`, `read`, and `remove` methods
- ⏰ **TTL Support** - Automatic expiration and cleanup of cached data
- 🔒 **Type Safe** - Full TypeScript support with proper type definitions
- 📁 **Hash-based Storage** - Efficient file organization using SHA-256 hashing
- 🛠️ **Configurable** - Customizable cache directory and options
- 🧹 **Auto Cleanup** - Expired cache files are automatically removed during reads
- 📦 **Zero Dependencies** - Uses only Node.js built-in modules

## Installation

```bash
npm install @rayriffy/filesystem
```

```bash
yarn add @rayriffy/filesystem
```

```bash
pnpm add @rayriffy/filesystem
```

```bash
bun add @rayriffy/filesystem
```

## Quick Start

```typescript
import { defineCacheInstance } from '@rayriffy/filesystem'

// Create a cache instance
const cache = defineCacheInstance()

// Write data with 5-minute TTL
await cache.write(['user', '123'], { name: 'John', age: 30 }, 5 * 60 * 1000)

// Read data
const result = await cache.read(['user', '123'])
if (result) {
  console.log(result.data) // { name: 'John', age: 30 }
  console.log(result.etag) // Content hash for validation
}

// Remove cached data
await cache.remove(['user', '123'])
```

## API Reference

### `defineCacheInstance(options?)`

Creates a new cache instance with the specified options.

**Parameters:**
- `options` (optional): Partial configuration options

**Returns:** Cache instance with `write`, `read`, and `remove` methods.

### `cache.write<T>(key, content, maxAgeInMs?, options?)`

Writes data to the cache with optional TTL.

**Parameters:**
- `key: Key[]` - Array of cache key components (string, number, or Buffer)
- `content: T` - Data to cache (must be JSON serializable)
- `maxAgeInMs?: number` - Time-to-live in milliseconds (default: 60000)
- `options?: Partial<Option>` - Override instance options for this operation

**Returns:** `Promise<{ etag: string, data: T } | undefined>`

### `cache.read<T>(key, options?)`

Reads data from the cache, automatically cleaning up expired entries.

**Parameters:**
- `key: Key[]` - Array of cache key components
- `options?: Partial<Option>` - Override instance options for this operation

**Returns:** `Promise<{ etag: string, data: T } | null>`

### `cache.remove(key, options?)`

Removes cached data for the specified key.

**Parameters:**
- `key: Key[]` - Array of cache key components
- `options?: Partial<Option>` - Override instance options for this operation

**Returns:** `Promise<void>`

## Configuration

### Default Options

```typescript
{
  enabled: true,
  cacheAlgorithm: 'sha256',
  cacheDirectory: path.join(process.cwd(), '.cache')
}
```

### Custom Configuration

```typescript
import { defineCacheInstance } from '@rayriffy/filesystem'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const cache = defineCacheInstance({
  cacheDirectory: join(tmpdir(), 'my-app-cache'),
  cacheAlgorithm: 'md5',
  enabled: process.env.NODE_ENV !== 'test'
})
```

## Advanced Usage

### Complex Keys

```typescript
// Use multiple key components for hierarchical caching
await cache.write(['api', 'users', userId, 'profile'], userData)
await cache.write(['api', 'posts', postId, 'comments'], comments)

// Keys can be mixed types
await cache.write(['session', userId, Date.now()], sessionData)
```

### Conditional Caching

```typescript
// Disable caching for specific operations
await cache.write(key, data, ttl, { enabled: false })

// Use different cache directory for specific data
await cache.write(key, data, ttl, { 
  cacheDirectory: '/tmp/special-cache' 
})
```

### ETags for Cache Validation

```typescript
const result = await cache.read(['api', 'data'])
if (result) {
  // Use etag for cache validation in HTTP responses
  response.setHeader('ETag', result.etag)
}
```

## Cache File Structure

The library organizes cache files using SHA-256 hashes:

```
.cache/
├── a1b2c3d4.../          # Hashed directory for key ['user', '123']
│   └── 300000.1699123456789.abcd1234.json
├── e5f6g7h8.../          # Hashed directory for key ['api', 'posts']
│   └── 600000.1699123456789.efgh5678.json
└── ...
```

File naming format: `{maxAge}.{expireAt}.{contentEtag}.json`

## TypeScript Support

Full TypeScript support with generic types:

```typescript
interface User {
  id: string
  name: string
  email: string
}

const cache = defineCacheInstance()

// Type-safe operations
await cache.write<User>(['users', '123'], { 
  id: '123', 
  name: 'John', 
  email: 'john@example.com' 
})

const user = await cache.read<User>(['users', '123'])
if (user) {
  // user.data is properly typed as User
  console.log(user.data.name)
}
```

## Error Handling

The library handles errors gracefully:

- Write failures are logged to console and return `undefined`
- Read failures for non-existent or corrupted files return `null`
- Remove failures are silently ignored
- Expired files are automatically cleaned up during read operations

## Performance Considerations

- Cache keys are hashed using SHA-256 for consistent file naming
- Expired files are cleaned up lazily during read operations
- Large datasets are JSON serialized, so consider the serialization cost
- File system operations are asynchronous and non-blocking

## Contributing

Issues and pull requests are welcome! Please check the [repository](https://github.com/rayriffy/filesystem) for contribution guidelines.
