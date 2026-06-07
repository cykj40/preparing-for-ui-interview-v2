/**
 * 5.4 Replace
 *
 * Implement `Replace<S, From, To>` which replaces the first occurrence of the string `From` with string `To` in the given string `S`.
 *
 * @example
 * type replaced = Replace<'types are fun!', 'fun', 'awesome'> // 'types are awesome!'
 */

import type { Equal, Expect } from '@course/types'

/* _____________ Your Code Here _____________ */

// Your implementation here
type Replace<
  S extends string,
  Target extends string,
  Replace extends string
> = Target extends ''
  ? S
  : S extends `${infer Head}${Target}${infer Tail}`
  ? `${Head}${Replace}${Tail}`
  : S
/* _____________ Test Cases _____________ */

export type cases = [
  Expect<Equal<Replace<'foobar', 'bar', 'foo'>, 'foofoo'>>,
  Expect<Equal<Replace<'foobarbar', 'bar', 'foo'>, 'foofoobar'>>,
  Expect<Equal<Replace<'foobarbar', '', 'foo'>, 'foobarbar'>>,
  Expect<Equal<Replace<'foobarbar', 'bar', ''>, 'foobar'>>,
  Expect<Equal<Replace<'foobarbar', 'bra', 'foo'>, 'foobarbar'>>,
  Expect<Equal<Replace<'', '', ''>, ''>>,
]
