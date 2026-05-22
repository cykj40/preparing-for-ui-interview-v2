// bun test src/problems/10-deep-clone/test/deep-clone.test.ts

import { detectType } from '@course/utils'

type TCollection = Map<any, any> | Set<any> | Record<any, any> | Array<any>

function getTarget(type: string): TCollection {
  switch (type) {
    case 'map':
      return new Map()
    case 'set':
      return new Set()
    case 'object':
      return {}
    case 'array':
      return []
    default:
      throw new Error('Unknown collection type')
  }
}

function entries(target: TCollection): Iterable<[key: any, value: any]> {
  if (target instanceof Map || target instanceof Set || target instanceof Array) {
    return target.entries()
  }
  return Object.entries(target)
}

function set(target: TCollection, key: any, value: any) {
  if (target instanceof Map) {
    target.set(key, value)
  } else if (target instanceof Set) {
    target.add(value)
  } else if (target instanceof Array) {
    target[key as number] = value
  } else {
    target[key] = value
  }
}

export function deepClone<T>(a: T, cache = new Map<any, any>()): T {
  const type = detectType(a)

  if (cache.has(a as object)) {
    return cache.get(a as object)
  }

  if (!a || typeof a !== 'object') {
    return a
  }

  switch (type) {
    case 'date':
      return new Date((a as unknown as Date).getTime()) as T
    case 'object':
    case 'map':
    case 'set':
    case 'array': {
      const target = getTarget(type)
      cache.set(a as object, target)
      for (const [key, value] of entries(a as TCollection)) {
        set(target, key, deepClone(value, cache))
      }
      return target as T
    }
    default:
      return a
  }
}

// --- Examples ---
// Uncomment to test your implementation:

// const obj = { a: { b: 1 }, c: [2, 3] }
// const cloned = deepClone(obj)
// cloned.a.b = 99
// console.log(obj.a.b)     // Expected: 1 (unaffected)
// console.log(cloned.a.b)  // Expected: 99
//
// const map = new Map([['key', { value: 1 }]])
// const clonedMap = deepClone(map)
// console.log(clonedMap.get('key'))  // Expected: { value: 1 }
// console.log(clonedMap.get('key') !== map.get('key'))  // Expected: true
//
// const circular: any = { a: 1 }; circular.self = circular
// const clonedCircular = deepClone(circular)
// console.log(clonedCircular.self === clonedCircular)  // Expected: true
