import { AbstractComponent, type TComponentConfig } from '@course/utils'
import css from './toast.module.css'
import flex from '@course/styles'
import cx from '@course/cx'

type TToastItem = {
  id: string
  text: string
}

/**
 * Expected usage:
 *   const toast = new Toast({ root: containerElement })
 *   toast.render()
 *   toast.toast({ id: '1', text: 'Hello' })
 *
 * Toast item: { id: '1', text: 'Vanilla Toast: 1' }
 */
let toastInstanceID = 0

export class Toast extends AbstractComponent<object> {
  id = toastInstanceID++
  listElement: HTMLUListElement | null = null

  constructor(config: TComponentConfig<object>) {
    super({
      ...config,
      listeners: ['animationend'],
    })
  }

  toast(item: TToastItem) {
    const element = document.createElement('div')
    element.innerHTML = this.getToastTemplate(item)
    const toastElement = element.firstElementChild as HTMLLIElement
    this.listElement?.appendChild(toastElement)

    setTimeout(() => {
      toastElement.classList.remove(css.fadeIn)
      toastElement.classList.add(css.fadeOut)
      toastElement.dataset.removed = 'true'
    }, 3000)
  }

  onAnimationend({ target }: AnimationEvent) {
    if (target instanceof HTMLElement && target.dataset.removed === 'true') {
      target.remove()
    }
  }

  toHTML() {
    return `<ul id="toast-instance-${this.id}" aria-live="polite" aria-relevant="additions removals" class="${cx(flex.flexColumnStart, css['toast-list'])}"></ul>`
  }

  getToastTemplate(item: TToastItem) {
    return `<li role="status" aria-atomic="true" aria-live="polite" data-removed="false" data-id="${item.id}" class="${css.fadeIn}">
      <div class="${cx(flex.flexColumnCenter, css.toast)}">
        <p>${item.text}</p>
      </div>
    </li>`
  }

  afterRender() {
    this.listElement = document.getElementById(`toast-instance-${this.id}`) as HTMLUListElement
  }
}
