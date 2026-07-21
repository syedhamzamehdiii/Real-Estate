import { useEffect, useRef } from 'react'
import './ScrollRiver.css'

export function ScrollRiver() {
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    const len = path.getTotalLength()
    path.style.strokeDasharray = String(len)
    path.style.strokeDashoffset = String(len)

    const update = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0
      path.style.strokeDashoffset = String(len - len * pct)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="river-track" aria-hidden="true">
      <svg viewBox="0 0 10 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8c968" />
            <stop offset="100%" stopColor="#6C581C" />
          </linearGradient>
        </defs>
        <path
          className="river-path-bg"
          d="M5,0 C5,150 5,150 5,300 S5,450 5,600 S5,850 5,1000"
        />
        <path
          ref={pathRef}
          className="river-path-fg"
          d="M5,0 C5,150 5,150 5,300 S5,450 5,600 S5,850 5,1000"
        />
      </svg>
    </div>
  )
}
