import { AbstractComponent, type TComponentConfig } from '@course/utils'
import css from './dialog.module.css'
import styles from '@course/styles'
import cx from '@course/cx'

export type TDialogProps = {
  content: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Expected input:
 * {
 *   "content": "<h2>Confirm Action</h2><p>Are you sure?</p>",
 *   "onConfirm": () => void,
 *   "onCancel": () => void
 * }
 *
 * Step 1: Extend AbstractComponent<TDialogProps>
 * - Call super() with config, adding listeners: ['click', 'close']
 * - Store a private reference for the <dialog> element (#dialogElement)
 */
export class Dialog extends AbstractComponent<TDialogProps> {
  #dialogElement: HTMLDialogElement | null = null

  constructor(config: TComponentConfig<TDialogProps>) {
    super({
      ...config,
      listeners: ['click', 'close'],
    })
  }

  /**
   * Step 2: Implement toHTML
   * - Return a <dialog> element with content section and footer
   * - Footer contains two buttons with data-action="confirm" and data-action="cancel"
   * - Use cx() and styles utilities for layout (padding24, bNone, br8, flexRowBetween, flexGap8)
   */
  toHTML(): string {
    // TODO: implement
    return `<dialog class="${cx(styles.padding24, styles.bNone, styles.br8, css.container)}">
      <section class="${styles.paddingVer8}">
        ${this.config.content || ''}
      </section>
      <footer class="${cx(styles.flexRowBetween, styles.flexGap8, styles.paddingVer8)}">
        <button data-action="confirm" autofocus>Confirm</button>
        <button data-action="cancel">Cancel</button>
      </footer>
    </dialog>`
  }

  /**
   * Step 3: Implement afterRender
   * - Query the <dialog> element from this.container and store in #dialogElement
   */
  afterRender(): void {
    // TODO: implement
    this.#dialogElement = this.container!.querySelector('dialog')!
  }

  /**
   * Step 4: Implement onClose
   * - Called when dialog is closed natively (e.g., Escape key)
   * - Call this.config.onCancel()
   */
  onClose(): void {
    // TODO: implement
    this.config.onCancel()
  }

  /**
   * Step 5: Implement onClick
   * - Read data-action attribute from event.target
   * - If "confirm": call onConfirm() and close()
   * - If "cancel": call onCancel() and close()
   */
  onClick(event: MouseEvent): void {
    // TODO: implement
    const target = event.target as HTMLElement
    const action = target.dataset.action
    if (action === 'confirm') {
      this.config.onConfirm()
      this.close()
    } else if (action === 'cancel') {
      this.config.onCancel()
      this.close()
    }
  }

  /**
   * Step 6: Implement open() and close()
   * - open(): call #dialogElement.showModal()
   * - close(): call #dialogElement.close()
   */
  open(): void {
    // TODO: implement
    this.#dialogElement?.showModal()
  }

  close(): void {
    // TODO: implement
    this.#dialogElement?.close()
  }
}
