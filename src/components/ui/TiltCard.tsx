import { useRef, type ReactNode, type CSSProperties } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import './TiltCard.css'

type TiltCardProps = {
  children: ReactNode
  className?: string
}

export function TiltCard({ children, className = '' }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const canTilt = useMediaQuery('(hover: hover) and (pointer: fine)')

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canTilt || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const rotY = ((x / rect.width) - 0.5) * 20
    const rotX = -((y / rect.height) - 0.5) * 20
    ref.current.style.transition = 'transform .08s linear'
    ref.current.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px) scale(1.02)`
  }

  const onLeave = () => {
    if (!ref.current) return
    ref.current.style.transition = 'transform .6s cubic-bezier(.16,.8,.28,1)'
    ref.current.style.transform =
      'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)'
  }

  const style: CSSProperties = { transformStyle: 'preserve-3d' }

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`.trim()}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  )
}
