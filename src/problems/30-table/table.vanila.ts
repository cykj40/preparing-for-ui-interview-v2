import { AbstractComponent, type TComponentConfig } from '@course/utils'
import styles from './table.module.css'
import flex from '@course/styles'
import cx from '@course/cx'

export interface TTableDataSource<T> {
  pageSize: number
  pages: number
  next: (page: number, pageSize: number) => Promise<T[]>
}

export type TTableColumn<T> = {
  id: string
  name: string
  renderer: (item: T) => string
  sort?: 'asc' | 'desc' | 'none'
}

export type TTableProps<T> = {
  columns: TTableColumn<T>[]
  datasource: TTableDataSource<T>
  search?: (query: string, data: T[]) => T[]
  comparator?: (columnId: keyof T, direction: 'asc' | 'desc') => (a: T, b: T) => number
}

/**
 * Expected input:
 * {
 *   columns: [{ id, name, renderer, sort? }],
 *   datasource: { pageSize, pages, next },
 *   search: (query, data) => filteredData,
 *   comparator: (columnId, direction) => compareFn
 * }
 *
 * Step 1: Extend AbstractComponent<TTableProps<T>>
 * - Call super() with config, adding:
 *   - className: [cx(flex.w100, flex.flexColumnStart)]
 *   - listeners: ['click', 'input']
 * - Store private fields: tbody, prevBtn, nextBtn, pageInfo (DOM refs)
 * - Store private state: data (T[]), currentPage (number), query (string),
 *   sort ({ columnId, direction } | null)
 * - Call initData() to fetch initial page
 *
 *
 *
 * Step 2: Implement data fetching
 * - initData: if data is empty, fetch page 0 via datasource.next, store result, call renderState
 * - fetchNext: if not on last page, increment currentPage; if data not yet fetched, call datasource.next and append; call renderState
 * - fetchPrev: decrement currentPage (min 0), call renderState
 *
 * Step 3: Implement setQuery and setSort
 * - setQuery: update query, reset currentPage to 0, call renderState
 * - setSort: update sort state, call renderState
 *
 * Step 4: Implement getSlice
 * - Filter data using search prop (or fallback to Object.values string matching)
 * - Sort filtered data using comparator prop if sort is active
 * - Slice to current page window
 * - Chain: [filterFn, sortFn, sliceFn].reduce(...)
 *
 * Step 5: Implement event handlers
 * - onClick: check for th click (read data-column-id, cycle sort direction: none→asc→desc→none)
 *   and button clicks (Prev/Next)
 * - onInput: check for search input, call setQuery
 *
 * Step 6: Implement renderState helpers
 * - renderState: calls renderRows, renderPagination, updateHeaderSortIcons
 * - renderRows: set tbody.innerHTML from getSlice() using column renderers
 * - renderPagination: update button disabled states and page info text
 * - updateHeaderSortIcons: update th text with sort arrows (↑/↓)
 *
 * Step 7: Implement afterRender
 * - Query and store DOM refs: tbody, prevBtn, nextBtn, pageInfo
 * - If data already loaded, call renderState
 *
 * Step 8: Implement toHTML
 * - Return <table> with <thead> (th elements with data-column-id, sort indicators)
 *   and empty <tbody>
 * - Controls div: Prev button (disabled), page info span, Next button, search input
 */
export class Table<T extends { id: string }> extends AbstractComponent<TTableProps<T>> {
  private tbody: HTMLTableSectionElement | null = null
  private prevBtn: HTMLButtonElement | null = null
  private nextBtn: HTMLButtonElement | null = null
  private pageInfo: HTMLSpanElement | null = null

  private data: T[] = []
  private currentPage = 0
  private query = ''
  private sort: { columnId: keyof T; direction: 'asc' | 'desc' | 'none' } | null = null

  constructor(config: TComponentConfig<TTableProps<T>>) {
    super({
      ...config,
      className: [flex.w100, flex.flexColumnStart],
      listeners: ['click', 'input'],
    })

    this.initData()
  }

  private async initData() {
    if (this.data.length === 0) {
      const initialData = await this.config.datasource.next(0, this.config.datasource.pageSize)
      this.data = initialData
      this.renderState()
    }
  }

  private async fetchNext() {
    if (this.currentPage >= this.config.datasource.pages - 1) return
    this.currentPage++

    const nextPage = this.currentPage

    if (
      this.data.length <= nextPage * this.config.datasource.pageSize &&
      this.data.length < this.config.datasource.pages * this.config.datasource.pageSize
    ) {
      const newData = await this.config.datasource.next(nextPage, this.config.datasource.pageSize)
      this.data = [...this.data, ...newData]
    }

    this.renderState()
  }

  private fetchPrev() {
    this.currentPage = Math.max(this.currentPage - 1, 0)
    this.renderState()
  }

  private setQuery(q: string) {
    this.query = q
    this.currentPage = 0
    this.renderState()
  }

  private setSort(columnId: keyof T, direction: 'asc' | 'desc' | 'none') {
    this.sort = { columnId, direction }
    this.renderState()
  }

  private getSlice() {
    const filterFn = (d: T[]) => {
      if (!this.query) return d
      return this.config.search
        ? this.config.search(this.query, d)
        : d.filter((item) =>
            Object.values(item).some((v) =>
              String(v).toLowerCase().includes(this.query.toLowerCase()),
            ),
          )
    }

    const sortFn = (d: T[]) => {
      const sortedColumn = this.config.columns.find((c) => c.id === this.sort?.columnId)
      if (!sortedColumn || !this.sort || !this.config.comparator || this.sort.direction === 'none')
        return d
      return [...d].sort(this.config.comparator(sortedColumn.id as keyof T, this.sort.direction))
    }

    const sliceFn = (d: T[]) => {
      const { pageSize } = this.config.datasource
      return d.slice(this.currentPage * pageSize, (this.currentPage + 1) * pageSize)
    }

    return [filterFn, sortFn, sliceFn].reduce((acc, fn) => fn(acc), this.data)
  }

  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement

    const th = target.closest('th')
    if (th?.dataset.columnId) {
      const columnId = th.dataset.columnId as keyof T
      const column = this.config.columns.find((c) => c.id === columnId)
      if (column) {
        const currentDirection =
          this.sort?.columnId === columnId ? this.sort.direction : (column.sort ?? 'none')
        const newDirection =
          currentDirection === 'desc' ? 'none' : currentDirection === 'asc' ? 'desc' : 'asc'
        this.setSort(columnId, newDirection)
      }
      return
    }

    if (target.matches('button')) {
      if (target.textContent === 'Prev') {
        this.fetchPrev()
      } else if (target.textContent === 'Next') {
        this.fetchNext()
      }
    }
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement
    if (target.type === 'search') {
      this.setQuery(target.value)
    }
  }

  private renderState() {
    this.renderRows()
    this.renderPagination()
    this.updateHeaderSortIcons()
  }

  private renderRows() {
    if (!this.tbody) return
    const { columns } = this.config
    const slice = this.getSlice()
    this.tbody.innerHTML = slice
      .map(
        (item) => `
            <tr>
                ${columns
                  .map(
                    (col) => `
                    <td>${col.renderer(item)}</td>
                `,
                  )
                  .join('')}
            </tr>
        `,
      )
      .join('')
  }

  private renderPagination() {
    if (!this.prevBtn || !this.nextBtn || !this.pageInfo) return
    const { pages } = this.config.datasource

    this.prevBtn.disabled = this.currentPage === 0
    this.nextBtn.disabled = this.currentPage === pages - 1
    this.pageInfo.textContent = `${this.currentPage + 1} / ${pages}`
  }

  private updateHeaderSortIcons() {
    if (!this.container) return
    const headers = this.container.querySelectorAll('th')
    headers.forEach((th) => {
      const columnId = th.dataset.columnId
      const column = this.config.columns.find((c) => c.id === columnId)
      if (column) {
        const currentSort =
          this.sort && this.sort.columnId === columnId ? this.sort.direction : column.sort
        th.textContent = `${column.name}${currentSort === 'asc' ? ' ↑' : currentSort === 'desc' ? ' ↓' : ''}`
      }
    })
  }

  afterRender() {
    super.afterRender()
    if (!this.container) return
    this.tbody = this.container.querySelector('tbody')
    this.prevBtn = this.container.querySelector('button:first-of-type')
    this.nextBtn = this.container.querySelector('button:last-of-type')
    this.pageInfo = this.container.querySelector('span')

    this.renderState()
  }

  toHTML(): string {
    const { columns, datasource } = this.config

    return `
            <div class="${styles.table}">
            <table>
                <thead>
                    <tr>
                        ${columns
                          .map(
                            (c) => `
                            <th data-column-id="${c.id}" style="cursor: pointer;">
                                ${c.name}${c.sort === 'asc' ? ' ↑' : c.sort === 'desc' ? ' ↓' : ''}
                            </th>
                        `,
                          )
                          .join('')}
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
            </div>
            <div class="${cx(flex.flexRowCenter, flex.flexGap8, styles.controls)}">
                <button disabled class="${cx(flex.paddingHor8)}">Prev</button>
                <span>1 / ${datasource.pages}</span>
                <button class="${cx(flex.paddingHor8)}">Next</button>
                <input type="search" placeholder="Filter" />
            </div>
        `
  }
}
