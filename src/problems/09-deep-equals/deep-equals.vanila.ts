// bun test src/problems/09-deep-equals/test/deep-equals.test.ts

import { detectType } from '@course/utils'

export function deepEquals(a: any, b: any, cache = new Map<any, Set<any>>()): boolean {
    if (a === b) return true
    const [typeA, typeB] = [detectType(a), detectType(b)]

    if (typeA !== typeB) return false

    if (typeA === 'object' || typeA === 'array') {
        const [keysA, keysB] = [Object.keys(a), Object.keys(b)]
        if (keysA.length !== keysB.length) return false
        if (!cache.has(a)) cache.set(a, new Set())
        if (cache.get(a)!.has(b)) return true
        cache.get(a)!.add(b)
        for (const key of keysA) {
            if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEquals(a[key], b[key], cache)) {
                return false
            }
        }
        return true
    }
    return a === b
}

// --- Examples ---
// Uncomment to test your implementation:

console.log(deepEquals(1, 1))                          // Expected: true
console.log(deepEquals('hello', 'hello'))               // Expected: true
console.log(deepEquals(null, undefined))                // Expected: false
console.log(deepEquals([1, 2, 3], [1, 2, 3]))          // Expected: true
console.log(deepEquals({ a: 1, b: 2 }, { b: 2, a: 1 })) // Expected: true
console.log(deepEquals({ a: 1 }, { a: 2 }))            // Expected: false
const a: any = { value: 1 }; a.self = a
const b: any = { value: 1 }; b.self = b
console.log(deepEquals(a, b))                           // Expected: true (circular)
