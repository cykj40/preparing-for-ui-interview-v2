/**
 * 1.1 Tuple Length
 *
 * For a given tuple, you need to create a generic `Length` that picks the length of the tuple
 * (as a specific number literal, not just `number`).
 *
 * @example
 * type tesla = ['tesla', 'model 3', 'model X', 'model Y']
 * type spaceX = ['FALCON 9', 'FALCON HEAVY', 'DRAGON', 'STARSHIP', 'HUMAN SPACEFLIGHT']
 *
 * type teslaLength = Length<tesla>  // 4
 * type spaceXLength = Length<spaceX> // 5
 */

import type { Equal, Expect } from '@course/types'


type tesla = ['tesla', 'model 3', 'model X', 'model Y']
type spaceX = ['FALCON 9', 'FALCON HEAVY', 'DRAGON', 'STARSHIP', 'HUMAN SPACEFLIGHT']

/* _____________ Your Code Here _____________ */

type Length<T extends readonly any[]> = T['length']

export type cases = [
  Expect<Equal<Length<tesla>, 4>>,
  Expect<Equal<Length<spaceX>, 5>>,
] 