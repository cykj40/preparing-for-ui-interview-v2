// bun test src/problems/14-promise/test/promise.test.ts

type PromiseStatus = 'pending' | 'fulfilled' | 'rejected'

const PENDING: PromiseStatus = 'pending'
const FULFILLED: PromiseStatus = 'fulfilled'
const REJECTED: PromiseStatus = 'rejected'

type Executor<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void,
) => void

type OnFulfilled<T, R> = ((value: T) => R | PromiseLike<R>) | undefined | null
type OnRejected<R> = ((reason: any) => R | PromiseLike<R>) | undefined | null

interface Handler<T> {
  onFulfilled: (value: T) => any
  onRejected: (reason: any) => any
  resolve: (value: any) => void
  reject: (reason: any) => void
}

export class MyPromise<T = any> {
  #handlers: Handler<T>[] = []
  #status: PromiseStatus = PENDING
  #value: T | any
  #isResolved: boolean = false

  #settle = (v: T | any, status: PromiseStatus = FULFILLED): void => {
    if (this.#isResolved) return
    this.#isResolved = true
    const update = (v: T | any): void => {
      this.#value = v
      this.#status = status
      this.#execute()
    }
    if (v instanceof MyPromise && status === FULFILLED) {
      v.then(update)
    } else {
      update(v)
    }
  }

  #resolve = (v: T | PromiseLike<T>): void => void this.#settle(v, FULFILLED)
  #reject = (e: any): void => void this.#settle(e, REJECTED)

  #execute = (): void => {
    const handlers = this.#handlers
    for (const { onFulfilled, onRejected, resolve, reject } of handlers) {
      const handler = this.#status === FULFILLED ? onFulfilled : onRejected
      queueMicrotask(() => {
        try {
          const result = handler(this.#value)
          if (result instanceof MyPromise) {
            result.then(resolve, reject)
          } else {
            resolve(result)
          }
        } catch (e) {
          reject(e)
        }
      })
    }
    this.#handlers = []
  }

  constructor(executor: Executor<T>) {
    this.#status = PENDING
    this.#isResolved = false
    try {
      executor(this.#resolve, this.#reject)
    } catch (e) {
      this.#reject(e)
    }
  }

  then<R = T>(onFulfilled?: OnFulfilled<T, R>, onRejected?: OnRejected<R>): MyPromise<R> {
    const handler: Handler<T> = {
      onFulfilled: typeof onFulfilled === 'function' ? onFulfilled : (v: T) => v as any,
      onRejected:
        typeof onRejected === 'function'
          ? onRejected
          : (err: any) => {
              throw err
            },
      resolve: () => {},
      reject: () => {},
    }

    const promise = new MyPromise<R>((res, rej) => {
      handler.resolve = res
      handler.reject = rej
    })

    this.#handlers.push(handler)

    if (this.#status !== PENDING) {
      this.#execute()
    }

    return promise
  }

  catch<R = never>(onRejected?: OnRejected<R>): MyPromise<T | R> {
    return this.then<T | R>(undefined, onRejected)
  }

  static resolve<T>(value: T): MyPromise<T> {
    return new MyPromise<T>((res) => res(value))
  }

  static reject<T = never>(value: any): MyPromise<T> {
    return new MyPromise<T>((_, rej) => rej(value))
  }
}

// --- Examples ---
// Uncomment to test your implementation:

// --- Step 4: constructor + Executor ---
// const p1 = new MyPromise((resolve: any) => resolve(42))
// console.log(p1) // Expected: MyPromise { status: 'fulfilled', value: 42 }
//
// const p2 = new MyPromise((_: any, reject: any) => reject('error'))
// console.log(p2) // Expected: MyPromise { status: 'rejected', value: 'error' }
//
// const p3 = new MyPromise(() => { throw new Error('oops') })
// console.log(p3) // Expected: MyPromise { status: 'rejected', value: Error: oops }
//
// const p4 = new MyPromise((resolve: any) => { resolve(1); resolve(2) })
// console.log(p4) // Expected: MyPromise { status: 'fulfilled', value: 1 } (settled once)

// --- Step 6: then / catch and chaining ---
// const p5 = new MyPromise((resolve: any) => resolve(42))
// p5.then((v: any) => console.log(v))  // Expected: 42
//
// const p6 = new MyPromise((resolve: any) => resolve(1))
//   .then((v: any) => v + 1)
//   .then((v: any) => console.log(v))   // Expected: 2
//
// const p7 = new MyPromise((_: any, reject: any) => reject('error'))
// p7.catch((e: any) => console.log(e))  // Expected: "error"
//
// new MyPromise((_: any, reject: any) => reject('error'))
//   .catch(() => 'recovered')
//   .then((v: any) => console.log(v))   // Expected: "recovered"
//
// new MyPromise((resolve: any) => resolve(1))
//   .then(() => { throw new Error('handler error') })
//   .catch((e: any) => console.log(e.message))  // Expected: "handler error"

// --- Step 7: static resolve, static reject ---
// MyPromise.resolve(99).then((v: any) => console.log(v))   // Expected: 99
// MyPromise.reject('no').catch((e: any) => console.log(e))  // Expected: "no"
