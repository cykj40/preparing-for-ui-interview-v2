import { AbstractComponent, type TComponentConfig } from '@course/utils'
import styles from './accordion.module.css'
import flex from '@course/styles'
import cx from '@course/cx'

/**
 * Expected input:
 * {
 *   root: HTMLElement,
 *   items: [
 *     { id: "1", title: "Section 1", content: "Lorem ipsum..." },
 *     { id: "2", title: "Section 2", content: "Sed ut perspiciatis..." }
 *   ]
 * }
 *
 * Steps to complete:
 * 1. Define properties — create TAccordionItem type (id, title, content) and TAccordionProps (items array)
 * 2. Init constructor — call super with config, add CSS classes (styles.container, flex utilities)
 * 3. Provide toHTML template — map over items, render <details>/<summary>/<p> for each
 * 4. Add CSS — use styles and cx() for className composition
 */
type TAccordionItem = {
  id: string
  title: string
  content: string
}
type TAccordionProps = {
  items: TAccordionItem[]
}

export class Accordion extends AbstractComponent<TAccordionProps> {
  constructor(config: TComponentConfig<TAccordionProps>) {
    super({
      ...config,
      className: [styles.container, flex.maxW600px, flex.flexColumnGap12, flex.w100, ...(config.className || [])],
    })
  }
  toHTML(): string {
    return `
    ${this.config.items.map((item: TAccordionItem) => `
    <details class="${styles.details}">
    <summary class="${cx(styles.summary, flex.flexRowBetween, flex.paddingHor16, flex.paddingVer12, flex.fontXL)}">${item.title}</summary>
    <p class="${cx(styles.content, flex.paddingVer16, flex.paddingHor16)}">${item.content}</p>
  </details>
    `).join('')}
    `
  }
}
