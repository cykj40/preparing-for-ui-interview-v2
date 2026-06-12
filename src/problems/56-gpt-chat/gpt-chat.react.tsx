import css from './gpt-chat.module.css'
import flex from '@course/styles'
import cx from '@course/cx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMarkdownStream } from 'src/utilities/use-markdown-stream'
import { Markdown } from '../55-markdown/solution/markdown.react'

/**
 * Expected behavior:
 * - Textarea + Send button to trigger streaming from /api/stream-markdown
 * - Chunks arrive via ReadableStream, queued and typed out char-by-char with requestAnimationFrame
 * - Rendered through a Markdown component
 * - Stop button to abort in-progress stream
 */

export const GPTComponent = () => {
  const { stream, abort, inProgress } = useMarkdownStream();
  const [chunks, setChunks] = useState<string[]>([])
  const [content, setContent] = useState<string>('')
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const contentRef = useRef<HTMLElement | null>(null)

  const type = useCallback(function recursiveType(chunk: string) {
    if (chunk.length === 0) {
      setIsTyping(false)
      return
    }
    setIsTyping(true)
    const slice = chunk.slice(0, 3)
    setContent(prev => prev + slice)
    const rest = chunk.slice(3)
    if (rest.length > 0) {
      requestAnimationFrame(() => recursiveType(rest))
    } else {
      setIsTyping(false)
    }
  }, [])

  const handleSend = () => {
    stream((chunk) => {
      console.log('chunk', chunk)
      setChunks(prev => [...prev, chunk])
    })
  }

  useEffect(() => {
    if (!isTyping && chunks.length > 0) {
      setIsTyping(true)
      const [nextChunk, ...rest] = chunks
      setChunks(rest)
      type(nextChunk)
    }
  }, [chunks, isTyping, type])

  useEffect(() => {
    contentRef.current?.scrollTo({
      top: contentRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [content])


  // Step 1: useMarkdownStream hook (define above or inline):
  //   - controllerRef for AbortController, inProgress state
  //   - stream(onChunk) — fetch with ReadableStream reader, decode chunks, call onChunk
  //   - abort() — controller.abort(), reset state
  // Step 2: State — chunks[] queue, content string (accumulated typed text), isTyping flag, contentRef for scroll
  // Step 3: handleSend — reset content/chunks, call stream() with onChunk that pushes to chunks queue
  // Step 4: type(chunk) — recursive function using requestAnimationFrame:
  //   - Take 2 chars at a time, append to content
  //   - When chunk exhausted, set isTyping=false to trigger next chunk processing
  //   - Auto-scroll contentRef to bottom
  // Step 5: useEffect on [chunks, isTyping] — if not typing and chunks available, shift next chunk and type it
  // Step 6: Render:
  //   - Content section with <Markdown text={content} />
  //   - Textarea + conditional Send/Stop button based on inProgress
  return <div className={css.chat}>
    <section className={css.chat__content} ref={contentRef}><Markdown text={content} /></section>
    <section className={css.chat__controls}>
      <textarea rows={5} />
      {inProgress ? (
        <button onClick={abort}>Stop</button>
      ) : (
        <button onClick={handleSend}>Send</button>
      )}
    </section>
  </div>
}
