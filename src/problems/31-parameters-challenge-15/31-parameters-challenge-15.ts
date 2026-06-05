/**
 * 4.2 Parameters
 *
 * Implement the built-in `Parameters<T>` generic without using it.
 *
 * @example
 * const foo = (arg1: string, arg2: number): void => {}
 *
 * type FunctionParamsType = MyParameters<typeof foo> // [arg1: string, arg2: number]
 */

import type { Equal, Expect } from '@course/types'

/* _____________ Your Code Here _____________ */

type MyParameters<T extends (...args: any[]) => any> = T extends (...args: infer P) => void ? P : never;

/* _____________ Test Cases _____________ */

export function foo(_arg1: string, _arg2: number): void { }
export function bar(_arg1: boolean, _arg2: { a: 'A' }): void { }
export function baz(): void { }

export type cases = [
  Expect<Equal<MyParameters<typeof foo>, [string, number]>>,
  Expect<Equal<MyParameters<typeof bar>, [boolean, { a: 'A' }]>>,
  Expect<Equal<MyParameters<typeof baz>, []>>,
]
