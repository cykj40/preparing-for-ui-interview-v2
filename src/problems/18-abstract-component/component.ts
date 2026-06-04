/**
 * Step 1: Understand TComponentConfig
 * - Generic type that extends T with component options
 * - root: the parent HTMLElement to mount into
 * - className: optional CSS classes for the container
 * - listeners: optional event types to bind (e.g., 'click', 'input')
 * - tag: optional HTML tag for the container element (default: 'div')
 */
export type TComponentConfig<T extends object> = T & {
  root: HTMLElement
  className?: string[]
  listeners?: string[]
  tag?: keyof HTMLElementTagNameMap
}

const DEFAULT_CONFIG: TComponentConfig<any> = {
  className: [],
  listeners: [],
  tag: 'div',
}

type TComponentListener = { type: string; callback: EventListenerOrEventListenerObject }

const toEventName = (type: string): string => {
  if (!type) return ''
  return `on${type[0].toUpperCase()}${type.slice(1)}`
}

export abstract class AbstractComponent<T extends object> {
  container: HTMLElement | null = null
  config: TComponentConfig<T>
  events: Array<TComponentListener> = []

  /**
   * Step 2: Understand constructor
   * - Merges DEFAULT_CONFIG with the provided config
   * - Initializes container as null (created later in init)
   * - Initializes events as an empty array
   */
  constructor(config: TComponentConfig<T>) {
    // TODO: implement
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.events = []
    this.container = null

  }

  /**
   * Step 3: Implement init
   * - Create a container element using document.createElement with config.tag
   * - Add CSS classes from config.className to the container
   * - For each listener in config.listeners:
   *   - Convert type to handler name using toEventName (e.g., 'click' -> 'onClick')
   *   - Look up the handler method on `this` by that name
   *   - Throw an error if the handler is not implemented
   *   - Bind the handler to `this` and attach it via addEventListener
   *   - Store { type, callback } in this.events array
   */
  init() {
    // TODO: implement
    this.container = document.createElement(this.config.tag as keyof HTMLElementTagNameMap)
    if (this.config.className) {
      for (const className of this.config.className) {
        this.container.classList.add(className)
      }
    }
    this.events = (this.config.listeners || []).map((type) => {
      const event = toEventName(type)
      // @ts-expect-error dynamic handler lookup on subclass (e.g. onClick)
      let callback = this[event] as ((e: Event) => void) | undefined
      if (!callback) {
        throw Error(`handler ${event} for ${type} is not implemented`)
      }
      callback = callback.bind(this)
      this.container!.addEventListener(type, callback)
      return { type, callback }
    })
  }

  afterRender() {
    // TODO: implement — hook after DOM attachment (optional override)

  }

  /**
   * Step 4: Implement render
   * - If container already exists, call destroy() to clean up
   * - Call init() to create a fresh container and bind events
   * - Set container.innerHTML to this.toHTML()
   * - Append the container to config.root
   * - Call afterRender() hook
   */
  render() {
    // TODO: implement
    if (this.container) {
      this.destroy()
    }
    this.init()
    this.container!.innerHTML = this.toHTML()
    this.config.root.appendChild(this.container!)
    this.afterRender()
  }

  toHTML(): string {
    return ``
  }

  /**
   * Step 5: Implement destroy
   * - Remove all event listeners stored in this.events from the container
   * - Clear the events array
   * - Remove the container from the DOM
   */
  destroy() {
    // TODO: implement
    this.events.forEach(({ type, callback }) => {
      this.container!.removeEventListener(type, callback)
    })
    this.events = []
    this.container!.remove()
  }
}
