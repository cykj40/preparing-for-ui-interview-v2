/**
 * 2.6 Merge
 *
 * Merge two types into a new type. Keys of the second type overrides the first type.
 *
 * @example
 * type Foo = { a: number; b: string }
 * type Bar = { b: number; c: boolean }
 *
 * type Result = Merge<Foo, Bar>
 * // { a: number; b: number; c: boolean }
 */

import type { Equal, Expect } from '@course/types'

/* _____________ Your Code Here _____________ */

// Your implementation here
type Merge<F extends object, S extends object> = {
    [P in keyof F | keyof S]: P extends keyof S ? S[P] : P extends keyof F ? F[P] : never
}

/* _____________ Test Cases _____________ */

type Foo = { a: number; b: string }
type Bar = { b: number; c: boolean }

export type cases = [Expect<Equal<Merge<Foo, Bar>, { a: number; b: number; c: boolean }>>]
