import React, { useEffect, useMemo, useState } from 'react'
import styles from './table.module.css'
import flex from '@course/styles'
import cx from '@course/cx'

type TSortDir = 'asc' | 'desc' | 'none'

export interface TTableDataSource<T> {
  pageSize: number
  pages: number
  next: (page: number, pageSize: number) => Promise<T[]>
}

export type TTableColumn<T> = {
  id: string
  name: string
  renderer: (item: T) => React.ReactNode
  sort?: 'asc' | 'desc' | 'none'
}

type TTableProps<T extends { id: string }> = {
  columns: TTableColumn<T>[]
  datasource: TTableDataSource<T>
  search?: (query: string, data: T[]) => T[]
  comparator?: (columnId: keyof T, direction: 'asc' | 'desc') => (a: T, b: T) => number
}

const nextDir = { none: 'asc', asc: 'desc', desc: 'none' } as const

type TSort<T> = {
  id: keyof T
  dir: TSortDir
}

export function Table<T extends { id: string }>({
  search,
  columns,
  datasource,
  comparator,
}: TTableProps<T>) {
  const [query, setQuery] = useState('')
  const [data, setData] = useState<T[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [sort, setSort] = useState<TSort<T> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setCurrentPage(0)
    setData([])

    datasource.next(0, datasource.pageSize).then((newData) => {
      if (cancelled) return
      setData(newData)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [datasource])

  const next = async () => {
    if (isLoading || currentPage >= datasource.pages - 1) return
    const nextPage = currentPage + 1

    if (data.length < (nextPage + 1) * datasource.pageSize) {
      setIsLoading(true)
      try {
        const newData = await datasource.next(nextPage, datasource.pageSize)
        setData((prev) => [...prev, ...newData])
      } finally {
        setIsLoading(false)
      }
    }

    setCurrentPage(nextPage)
  }

  const prev = () => setCurrentPage((p) => Math.max(p - 1, 0))

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setCurrentPage(0)
  }

  const onSort: React.MouseEventHandler<HTMLTableSectionElement> = ({ target }) => {
    if (!(target instanceof HTMLElement) || !target.dataset.columnId) return
    const columnId = target.dataset.columnId as keyof T
    const column = columns.find((c) => c.id === columnId)
    if (!column) return
    setSort((prev) => {
      const dir = prev?.id === columnId ? prev.dir : (column.sort ?? 'none')
      return { id: columnId, dir: nextDir[dir] }
    })
  }

  const slice = useMemo(() => {
    const filtered = query
      ? search
        ? search(query, data)
        : data.filter((item) => item.id.includes(query))
      : data
    const sorted =
      sort && comparator && sort.dir !== 'none'
        ? [...filtered].sort(comparator(sort.id as keyof T, sort.dir))
        : filtered
    const start = currentPage * datasource.pageSize
    return sorted.slice(start, start + datasource.pageSize)
  }, [data, query, search, sort, comparator, currentPage, datasource])

  return (
    <div className={cx(flex.w100, flex.flexColumnStart)}>
      <div className={styles.table}>
        <table>
          <thead onClickCapture={onSort}>
            <tr>
              {columns.map((c) => {
                const currentSort = sort?.id === c.id ? sort.dir : c.sort
                return (
                  <th data-column-id={c.id} key={c.id} style={{ cursor: 'pointer' }}>
                    {c.name}
                    {currentSort === 'asc' ? ' ↑' : currentSort === 'desc' ? ' ↓' : ''}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {slice.map((item) => (
              <tr key={item.id}>
                {columns.map((col) => (
                  <td key={col.id}>{col.renderer(item)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={cx(flex.flexRowCenter, flex.flexGap8, styles.controls)}>
        <button type="button" disabled={isLoading || currentPage === 0} onClick={prev}>
          Prev
        </button>
        <span>
          {currentPage + 1} / {datasource.pages}
        </span>
        <button
          type="button"
          disabled={isLoading || currentPage >= datasource.pages - 1}
          onClick={() => void next()}
        >
          Next
        </button>
        <input type="search" placeholder="Filter" value={query} onChange={onSearch} />
      </div>
    </div>
  )
}

export default Table
