import { AbstractComponent, type TComponentConfig } from '@course/utils'
import flex from '@course/styles'
import cx from '@course/cx'
import css from './tabs.module.css'

export type TTabProps = {
  name: string
  content: string
}

export type TTabsProps = {
  target?: HTMLElement
  defaultTab?: string
  tabs: TTabProps[]
}

export class Tabs extends AbstractComponent<TTabsProps> {
  #defaultTab: string
  #contentContainer: HTMLElement | null = null
  #activeTabName: string | undefined

  constructor(config: TComponentConfig<TTabsProps>) {
    super({
      ...config,
      listeners: ['click'],
    })
    this.#defaultTab = config.defaultTab ?? config.tabs[0].name
  }

  toHTML(): string {
    const classes = cx(css.root, flex.w100, ...(this.config.className ?? []))
    const contentHtml = this.config.target
      ? ''
      : `<section role="tabpanel" id="tab-panel" aria-labelledby="tab-${this.#defaultTab}" class="${css.container}"></section>`

    return `
      <nav class="${classes}">
        <ul role="tablist" class="${cx(css.tabList, flex.flexRowStart, flex.flexGap16)}">
          ${this.config.tabs.map((tab) => this.getTab(tab)).join('')}
        </ul>
      </nav>
      ${contentHtml}
    `
  }

  getTab({ name }: TTabProps) {
    return `<li role="presentation"><button type="button" role="tab" id="tab-${name}" data-tab-name="${name}" aria-controls="tab-panel" aria-selected="false" class="${css.tab}">${name}</button></li>`
  }

  afterRender(): void {
    if (!this.config.target) {
      this.#contentContainer =
        this.container!.querySelector('#tab-panel') ??
        this.container!.querySelector(`.${css.container}`)
    }
    this.activate(this.#defaultTab)
  }

  activate(tabName: string): void {
    const tab = this.config.tabs.find((t) => t.name === tabName)
    if (!tab) return

    const buttons = this.container?.querySelectorAll('[role="tab"]')
    buttons?.forEach((btn) => {
      const isActive = (btn as HTMLElement).dataset.tabName === tabName
      btn.setAttribute('aria-selected', String(isActive))
    })

    this.#activeTabName = tabName

    const panel = this.config.target ?? this.#contentContainer
    if (!panel) return

    panel.setAttribute('aria-labelledby', `tab-${tabName}`)
    panel.innerHTML = tab.content
  }

  onClick(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest('button')
    if (!button) return

    const tabName = button.dataset.tabName
    if (tabName && tabName !== this.#activeTabName) {
      this.activate(tabName)
    }
  }
}
