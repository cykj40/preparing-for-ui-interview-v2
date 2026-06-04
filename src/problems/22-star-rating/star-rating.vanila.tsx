import { AbstractComponent, type TComponentConfig } from '@course/utils'
import css from './star-rating.module.css'
import flex from '@course/styles'
import cx from '@course/cx'

const STAR = '⭐️'
const STARS_COUNT = 5

type TStarRatingProps = {
  value: number
  onValueChange?: (value: number) => void
  readOnly?: boolean
}

export class StarRating extends AbstractComponent<TStarRatingProps> {
  value: number = 0

  constructor(props: TComponentConfig<TStarRatingProps>) {
    super({
      ...props,
      className: [css.container, ...(props.className || [])],
      listeners: ['click'],
      tag: 'div',
    })
    this.value = props.value
  }

  onClick(event: MouseEvent): void {
    if (this.config.readOnly) return

    const button = (event.target as HTMLElement).closest('button')
    if (!button) return

    const starValue = Number(button.dataset.starValue)
    if (!Number.isNaN(starValue)) {
      this.value = starValue
      this.config.onValueChange?.(starValue)
      this.render()
    }
  }

  toHTML(): string {
    const readonly = this.config.readOnly ?? false

    const stars = Array.from({ length: STARS_COUNT }, (_, index) => {
      const starValue = index + 1
      return `
        <button
          type="button"
          data-star-value="${starValue}"
          data-active="${this.value >= starValue}"
          class="${cx(css.star, flex.flexColumnCenter, flex.fontXL)}"
          role="radio"
          aria-label="${starValue} Star${starValue === 1 ? '' : 's'}"
          aria-checked="${this.value === starValue}"
          aria-readonly="${readonly}"
          ${readonly ? 'disabled' : ''}
        ><span>${STAR}</span></button>
      `
    }).join('')

    return `
      <input type="number" value="${this.value}" readonly hidden />
      <div class="${flex.flexRowCenter}">${stars}</div>
    `
  }

  afterRender(): void {
    if (!this.container) return

    this.container.setAttribute('role', 'radiogroup')
    this.container.setAttribute('aria-label', 'Star Rating')
    this.container.setAttribute('aria-readonly', String(this.config.readOnly ?? false))
  }
}
