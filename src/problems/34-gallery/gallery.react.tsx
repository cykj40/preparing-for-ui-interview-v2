import css from './gallery.module.css'
import flex from '@course/styles'
import cx from '@course/cx'
import { useState, useEffect, useCallback } from 'react'

type TGalleryProps = {
  images: string[]
}

/**
 * Expected input:
 * <Gallery images={['url1.jpg', 'url2.jpg', 'url3.jpg']} />
 */
export const Gallery = ({ images }: TGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - 1))
  }, [])

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => Math.min(images.length - 1, prevIndex + 1))
  }, [images.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext])

  if (images.length === 0) {
    return (
      <section className={cx(flex.w100, flex.maxW800px, flex.h600px, flex.pRel, css.container)}>
        <div className={cx(flex.flexRowCenter, flex.h100, css.empty, flex.fontX)}>
          No images to display
        </div>
      </section>
    )
  }

  return (
    <section className={cx(flex.w100, flex.maxW800px, flex.h600px, flex.pRel, css.container)}>
      <button
        type="button"
        disabled={currentIndex === 0}
        className={cx(
          css.button,
          flex.pAbs,
          flex.top0,
          flex.left0,
          flex.z1,
          flex.bgBlack4,
          flex.h100,
          flex.shadow2,
          flex.cWhite7,
          flex.bNone,
          flex.fontXL,
        )}
        onClick={handlePrev}
        aria-label="Previous image"
      >
        {'<'}
      </button>

      <ul
        className={cx(flex.flexRowStart, flex.h100, css.list)}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <li key={index} className={cx(flex.wh100, css.item)}>
            <img
              className={flex.wh100}
              src={currentIndex + 2 >= index ? image : undefined}
              alt={`Gallery image ${index + 1}`}
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={currentIndex === images.length - 1}
        className={cx(
          css.button,
          flex.pAbs,
          flex.top0,
          flex.right0,
          flex.z1,
          flex.bgBlack4,
          flex.h100,
          flex.shadow2,
          flex.cWhite7,
          flex.bNone,
          flex.fontXL,
        )}
        onClick={handleNext}
        aria-label="Next image"
      >
        {'>'}
      </button>

      <div
        className={cx(
          flex.justifyCenter,
          flex.flexGap8,
          flex.pAbs,
          flex.left0,
          flex.right0,
          flex.z1,
          css.indicators,
        )}
      >
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            className={cx(
              css.dot,
              flex.bgWhite5,
              flex.br128,
              currentIndex === index ? css.dotActive : '',
            )}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
