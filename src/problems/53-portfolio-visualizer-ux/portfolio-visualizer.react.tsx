import css from './portfolio-visualizer.module.css'
import cx from '@course/cx'
import styles from '@course/styles'

export type TPortfolioNode = {
  id: string
  name: string
  value: number
  children?: TPortfolioNode[]
}

type TPortfolioVisualizerProps = {
  data: TPortfolioNode
}

/**
 * Expected data:
 * {
 *   id: 'root', name: 'Portfolio', value: 1000,
 *   children: [
 *     { id: 'stocks', name: 'Stocks', value: 600, children: [
 *       { id: 'aapl', name: 'AAPL', value: 300 },
 *       { id: 'goog', name: 'GOOG', value: 300 },
 *     ]},
 *     { id: 'bonds', name: 'Bonds', value: 400 },
 *   ]
 * }
 */

// Step 1: PortfolioNode component — receives TPortfolioNode props + total (root value)
//   - Calculate percentage: (value / total) * 100, formatted to 2 decimal places
//   - Render <details open> with:
//     - <summary> containing a row with <strong>name</strong> and a group of:
//       - <input type="number" data-node-id={id} defaultValue={value}>
//       - <output> showing percentage%
//   - Recursively render children, passing the same total to each childtion

function PortfolioNode({ id, name, value, children, total }: TPortfolioNode & { total: number }) {
  const percentage = Math.round((value / total) * 100).toFixed(2);

  return <details open={true}>
    <summary className={cx(styles.padding8)}>
      <strong>{name}</strong>
      <div className={cx(styles.flexRowBetween, styles.flexRowGap8)}>
        <input type="text" data-node-id={id} defaultValue={value} />
        <output>{percentage}%</output>
      </div>

    </summary>
    <ul className={cx(styles.paddingLeft16, styles.paddingVer8, css.listUl)}>
      {children?.map((child) => (
        <li key={child.id}>
          <PortfolioNode {...child} total={total} />
        </li>
      ))}
    </ul>

  </details>
}

export function PortfolioVisualizer({ data }: TPortfolioVisualizerProps) {
  // Step 2: Render — container div, render root PortfolioNode with total={data.value}
  return <PortfolioNode {...data} total={data.value} />
}
