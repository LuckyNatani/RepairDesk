import { useEffect, useRef, useState } from 'react'

export function useScrollDirection() {
  const [scrollingDown, setScrollingDown] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const el = document.getElementById('scroll-container') || window
    const handler = () => {
      const current = el === window ? window.scrollY : el.scrollTop
      setScrollingDown(current > lastY.current + 5)
      lastY.current = current
    }
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  return scrollingDown
}
