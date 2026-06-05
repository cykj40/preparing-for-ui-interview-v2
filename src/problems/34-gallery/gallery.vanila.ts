import { AbstractComponent, type TComponentConfig } from '@course/utils'
import styles from './gallery.module.css'
import flex from '@course/styles'
import cx from '@course/cx'

export type TGalleryProps = {
  images: string[]
}

export class Gallery extends AbstractComponent<TGalleryProps> {
  private list: HTMLUListElement | null = null
  private prevBtn: HTMLButtonElement | null = null
  private nextBtn: HTMLButtonElement | null = null
  private dots: HTMLButtonElement[] = []
  private currentIndex = 0

  constructor(config: TComponentConfig<TGalleryProps>) {
    super({
      ...config,
      className: [styles.container, flex.w100, flex.maxW800px, flex.h600px, flex.pRel],
      listeners: ['click'],
    })
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  init() {
    super.init()
    window.addEventListener('keydown', this.handleKeyDown)
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown)
    super.destroy()
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') this.handlePrev()
    if (e.key === 'ArrowRight') this.handleNext()
  }

  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement

    if (target.closest(`.${styles.buttonPrev}`)) {
      this.handlePrev()
    } else if (target.closest(`.${styles.buttonNext}`)) {
      this.handleNext()
    } else {
      const dot = target.closest(`.${styles.dot}`)
      if (dot) {
        const index = Array.from(dot.parentElement!.children).indexOf(dot)
        this.goToSlide(index)
      }
    }
  }

  handlePrev() {
    this.goToSlide(Math.max(0, this.currentIndex - 1))
  }

  handleNext() {
    this.goToSlide(Math.min(this.config.images.length - 1, this.currentIndex + 1))
  }

  goToSlide(index: number) {
    if (index === this.currentIndex) return
    this.currentIndex = index
    this.updateView()
  }

  updateView() {
    if (!this.list || !this.prevBtn || !this.nextBtn) return

    this.list.style.transform = `translateX(-${this.currentIndex * 100}%)`
    this.prevBtn.disabled = this.currentIndex === 0
    this.nextBtn.disabled = this.currentIndex === this.config.images.length - 1

    this.dots.forEach((dot, index) => {
      if (index === this.currentIndex) {
        dot.classList.add(styles.dotActive)
      } else {
        dot.classList.remove(styles.dotActive)
      }
    })

    const items = this.list.querySelectorAll(`.${styles.item} img`)
    items.forEach((img, index) => {
      if (this.currentIndex + 2 >= index) {
        const src = this.config.images[index]
        if (img.getAttribute('src') !== src) {
          img.setAttribute('src', src)
        }
      }
    })
  }

  afterRender() {
    super.afterRender()
    this.list = this.container!.querySelector(`.${styles.list}`)
    this.prevBtn = this.container!.querySelector(`.${styles.buttonPrev}`)
    this.nextBtn = this.container!.querySelector(`.${styles.buttonNext}`)
    this.dots = Array.from(this.container!.querySelectorAll(`.${styles.dot}`))
    this.updateView()
  }

  toHTML(): string {
    const { images } = this.config

    if (images.length === 0) {
      return `<div class="${cx(styles.empty, flex.fontX, flex.flexRowCenter, flex.h100)}">No images to display</div>`
    }

    return `
            <button
                ${this.currentIndex === 0 ? 'disabled' : ''}
                class="${cx(styles.button, styles.buttonPrev, flex.pAbs, flex.top0, flex.left0, flex.z1, flex.bgBlack4, flex.h100, flex.shadow2, flex.cWhite7, flex.bNone, flex.fontXL)}"
                aria-label="Previous image"
            >
                &lt;
            </button>

            <ul
                class="${cx(flex.flexRowStart, flex.h100, styles.list)}"
                style="transform: translateX(-${this.currentIndex * 100}%)"
            >
                ${images
                  .map(
                    (image, index) => `
                    <li class="${cx(flex.wh100, styles.item)}">
                        <img
                            class="${flex.wh100}"
                            src="${this.currentIndex + 2 >= index ? image : ''}"
                            alt="Gallery image ${index + 1}"
                        />
                    </li>
                `,
                  )
                  .join('')}
            </ul>

            <button
                ${this.currentIndex === images.length - 1 ? 'disabled' : ''}
                class="${cx(styles.button, styles.buttonNext, flex.pAbs, flex.top0, flex.right0, flex.z1, flex.bgBlack4, flex.h100, flex.shadow2, flex.cWhite7, flex.bNone, flex.fontXL)}"
                aria-label="Next image"
            >
                &gt;
            </button>

            <div class="${cx(flex.justifyCenter, flex.flexGap8, flex.pAbs, flex.left0, flex.right0, flex.z1, styles.indicators)}">
                ${images
                  .map(
                    (_, index) => `
                    <button
                        type="button"
                        class="${cx(styles.dot, flex.bgWhite5, flex.br128, this.currentIndex === index ? styles.dotActive : '')}"
                        aria-label="Go to image ${index + 1}"
                    ></button>
                `,
                  )
                  .join('')}
            </div>
        `
  }
}
