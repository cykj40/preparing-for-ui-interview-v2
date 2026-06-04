import { AbstractComponent, type TComponentConfig } from '@course/utils'
import css from './tooltip.module.css'
import cx from '@course/cx'

type TPositionType = 'top' | 'bottom' | 'left' | 'right' | 'auto'

type TCandidate = { position: 'top' | 'bottom' | 'left' | 'right'; x: number; y: number }

type TTooltipProps = {
    position?: TPositionType
    children: HTMLElement
    content: string
    boundary?: HTMLElement
}

const positions = {
    top: css.top,
    bottom: css.bottom,
    left: css.left,
    right: css.right,
} as const

let id = 0

/**
 * Helper: determine best position when position='auto'
 * - Get bounding rects for tooltip and container
 * - Check candidates (top, right, bottom, left) against boundary
 * - Return first position that fits, or 'top' as fallback
 */
function getAutoPosition(
    tooltip: HTMLElement,
    container: HTMLElement,
    boundaryRect: { left: number; top: number; right: number; bottom: number },
): 'top' | 'bottom' | 'left' | 'right' {
    const t = tooltip.getBoundingClientRect()
    const c = container.getBoundingClientRect()
    const { width: tw, height: th } = t
    const { left: trL, top: trT, right: trR, bottom: trB } = c

    const fits = (x: number, y: number) =>
        x >= boundaryRect.left &&
        y >= boundaryRect.top &&
        Math.ceil(x + tw) <= boundaryRect.right &&
        Math.ceil(y + th) <= boundaryRect.bottom

    const candidates: TCandidate[] = [
        { position: 'top', x: trL + c.width / 2 - tw / 2, y: trT - th - 8 },
        { position: 'right', x: trR + 8, y: trT + c.height / 2 - th / 2 },
        { position: 'bottom', x: trL + c.width / 2 - tw / 2, y: trB + 8 },
        { position: 'left', x: trL - tw - 8, y: trT + c.height / 2 - th / 2 },
    ]

    return candidates.find(({ x, y }) => fits(x, y))?.position ?? 'top'
}

export class Tooltip extends AbstractComponent<TTooltipProps> {
    id = id++
    tooltip: HTMLElement | null = null

    constructor(config: TComponentConfig<TTooltipProps>) {
        super({
            ...config,
            className: [css.container],
            listeners: ['mouseenter', 'mouseleave', 'focusin', 'focusout', 'keydown'],
        })
    }

    toHTML(): string {
        const position = this.config.position ?? 'top'
        const positionClass =
            position === 'auto' ? undefined : positions[position as keyof typeof positions]

        return `<div role="tooltip" id="tooltip-${this.id}" style="display: none;" class="${cx(css.tooltip, ...(positionClass ? [positionClass] : []))}">${this.config.content}</div>`
    }

    /**
     * Step 3: Implement afterRender
     * - Append this.config.children (the trigger element) to this.container
     * - Query and store the tooltip element by its id
     * a11y: set aria-describedby on the trigger element pointing to the tooltip id
     */
    afterRender(): void {
        this.container!.appendChild(this.config.children)
        this.tooltip = this.container!.querySelector(`#tooltip-${this.id}`)
        this.config.children.setAttribute('aria-describedby', `tooltip-${this.id}`)
    }

    /**
     * Step 4: Implement event handlers
     * - onMouseenter / onFocusin: show the tooltip (call showTooltip)
     * - onMouseleave / onFocusout: hide the tooltip (set display to 'none')
     * - onKeydown: hide on Escape key
     * a11y: focusin/focusout ensure keyboard users can trigger tooltip; Escape dismisses it
     */
    onMouseenter() {
        this.showTooltip()
    }

    onMouseleave() {
        this.hideTooltip()
    }

    onFocusin() {
        this.showTooltip()
    }

    onFocusout() {
        this.hideTooltip()
    }

    onKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            this.hideTooltip()
        }
    }

    showTooltip() {
        if (!this.tooltip) return

        this.tooltip.style.display = 'block'

        if (this.config.position === 'auto') {
            const boundaryRect = this.config.boundary
                ? this.config.boundary.getBoundingClientRect()
                : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }

            const side = getAutoPosition(this.tooltip, this.container!, boundaryRect)
            for (const classname of Object.values(positions)) {
                this.tooltip.classList.remove(classname)
            }
            this.tooltip.classList.add(positions[side])
        }
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none'
        }
    }
}
