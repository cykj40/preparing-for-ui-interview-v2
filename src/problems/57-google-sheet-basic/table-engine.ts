// bun test src/problems/57-google-sheet-basic/test/table-engine.test.ts

import type { CellId, Compiled } from '../../utilities/google-sheet-parser'

export type { CellId } from '../../utilities/google-sheet-parser'

export class TableEngine {
  // TODO: Step 1 - Setup Hash Maps
  // Instantiate 4 Map structures:
  #raw: Map<CellId, string> = new Map()
  #val: Map<CellId, string> = new Map()
  #deps: Map<CellId, Set<CellId>> = new Map()
  #reverseDeps: Map<CellId, Set<CellId>> = new Map()
  #compiled: Map<CellId, Compiled> = new Map()
  // - #raw: What the user typed ("10" or "=A1+5")
  // - #val: The computed mathematical result ("10" or "15")
  // - #deps: Direct dependencies (A1 requires B1 to compute)
  // - #reverseDeps: Reverse dependencies (B1 affects A1, so A1 recomputes if B1 changes)
  setRaw(_id: CellId, _raw: string): { changed: CellId[] } {
    this.#raw.set(_id, _raw)
    this.#val.set(_id, _raw)
    this.#compiled.delete(_id)
    return { changed: [_id] }
  }

  getRaw(_id: CellId): string {
    return this.#raw.get(_id) ?? ''
  }

  getValue(_id: CellId): string {
    return this.#val.get(_id) ?? ''
  }

  getDeps(_id: CellId): ReadonlySet<CellId> {
    const set = this.#deps.get(_id) ?? new Set()
    this.#deps.set(_id, set)
    return set
  }

  getRevDeps(_id: CellId): ReadonlySet<CellId> {
    const set = this.#reverseDeps.get(_id) ?? new Set()
    this.#reverseDeps.set(_id, set)
    return set
  }
}
