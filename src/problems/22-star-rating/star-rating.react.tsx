import { useCallback } from 'react'
import css from './star-rating.module.css'
import flex from '@course/styles'
import cx from '@course/cx'

const STAR = '⭐️'
const STARS_COUNT = 5

type TProps = {
  value: number
  onChange: (value: number) => void
  readonly?: boolean
}

export const StarRating = ({ value, onChange, readonly }: TProps) => {
  const handleStarClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (readonly) return
      const button = (event.target as HTMLElement).closest('button')
      if (!button) return
      const starValue = Number(button.dataset.starValue)
      if (!Number.isNaN(starValue)) {
        onChange(starValue)
      }
    },
    [readonly, onChange],
  )

  return (
    <div
      className={cx(css.container, flex.wh100)}
      onClick={handleStarClick}
      role="radiogroup"
      aria-label="Star Rating"
      aria-readonly={readonly}
    >
      <input type="number" value={value} readOnly hidden />
      <div className={flex.flexRowCenter}>
        {Array.from({ length: STARS_COUNT }, (_, index) => {
          const starValue = index + 1
          return (
            <button
              key={starValue}
              type="button"
              data-star-value={starValue}
              data-active={value >= starValue}
              className={cx(css.star, flex.flexColumnCenter, flex.fontXL)}
              role="radio"
              aria-label={`${starValue} Star${starValue === 1 ? '' : 's'}`}
              aria-checked={value === starValue}
              aria-readonly={readonly}
              disabled={readonly}
            >
              <span>{STAR}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
