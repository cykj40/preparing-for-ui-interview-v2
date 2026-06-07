import { useState } from 'react'
import flex from '@course/styles'
import cx from '@course/cx'
import styles from './square-game.module.css'

const GAME_SIZE = 3

/**
 * Expected data:
 * state = [
 *   [1, 2, 3],
 *   [4, null, 5],
 *   [7, 8, 6]
 * ]
 * - 2D array of numbers and one null (empty cell)
 * - Click a cell adjacent to null to swap them
 */

function createGAmeState(): Array<Array<number | null>> {
  const state = Array.from({
    length: GAME_SIZE ** 2
  },
    (_, index) => (index === GAME_SIZE ** 2 - 1 ? null : index + 1)
  )
  state.sort(() => Math.random() - 0.5)
  return Array.from({
    length: GAME_SIZE
  },
    (_, index) => state.slice(index * GAME_SIZE, (index + 1) * GAME_SIZE),
  )
}

function isWin(state: Array<Array<number | null>>) {
  return state.flat().every((value, index) => {
    if (value == null) {
      return index === GAME_SIZE ** 2 - 1
    }
    return value === index + 1
  })
}

function validate([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  const isValidVerticalMove = x1 === x2 && (y1 === y2 - 1 || y1 === y2 + 1);
  const isValidHorizontalMove = y1 === y2 && (x1 === x2 - 1 || x1 === x2 + 1);
  return isValidVerticalMove || isValidHorizontalMove
}

type TSquareGameProps = {
  initState?: Array<Array<number | null>>
}

export const SquareGame = ({ initState }: TSquareGameProps = {}) => {
  const [state, setState] = useState(initState ?? createGAmeState());
  const emptyReference = useRef<HTMLDivElement | null | undefined>(null)

  const handleCellClick: React.MouseEventHandler = ({ target }) => {
    if (target instanceof HTMLELEMENT
      && target.dataset.row
      && target.dataset.col
      && emptyReference.current?.dataset.row
      && emptyReference.current?.dataset.col




    ) {
      const [x1, y1] = [
        +emptyReference.current?.dataset.row,
        +emptyReference.current?.dataset.col
      ]
      const [x2, y2] = [target.dataset.row, target.dataset.col]
      const clone = structuredClone(state);
      if (validate([x1, y1], [x2, y2])) {
        [clone[x1][y1], clone[x2][y2]] = [clone[x2][y2], clone[x1][y1]]
        setState(clone)
      }
    }
  }

  // Step 1: State — useState initialized with initState ?? getGameState(GAME_SIZE)
  // Step 2: handleCellClick — event delegation handler:
  //   - Read data-row and data-col from clicked element
  //   - Find empty position with getEmptyPosition(state)
  //   - Validate move with validate([row, col], [emptyRow, emptyCol])
  //   - If valid, structuredClone state, swap cells, setState
  // Step 3: Render:
  //   - Display win status using isWin(state)
  //   - Board div with onClickCapture, map state rows and cells
  //   - Each cell div has data-row, data-col, conditional styling for null vs filled
  return <div style={style.grid} onClick={handleCellClick}>
    {state.map((row, rowIndex) => {
      return row.map((col, colIndex) => {
        return <div ref={col === null ? emptyReference : undefined} className={styles.grid__cell} data-row={rowIndex} data-col={colIndex} data-empty={col === null}>${col === null ? '' : col}</div>
      })
    })}
  </div>
}
