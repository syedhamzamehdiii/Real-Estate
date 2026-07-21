import type { ElementType, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useReveal } from '../../hooks/useReveal'

type RevealProps = {
  children: ReactNode
  className?: string
  as?: ElementType
}

export function Reveal({ children, className = '', as: Tag = 'div' }: RevealProps) {
  const { ref, visible } = useReveal<HTMLElement>()
  return (
    <Tag ref={ref} className={`reveal ${visible ? 'in' : ''} ${className}`.trim()}>
      {children}
    </Tag>
  )
}

type SectionHeadProps = {
  tag: string
  title: ReactNode
  description?: string
}

export function SectionHead({ tag, title, description }: SectionHeadProps) {
  return (
    <div className="section-head">
      <div className="tag">{tag}</div>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  )
}

type ButtonProps = {
  children: ReactNode
  variant?: 'gold' | 'outline'
  to?: string
  href?: string
  type?: 'button' | 'submit'
  onClick?: () => void
  className?: string
  disabled?: boolean
  ariaLabel?: string
}

export function Button({
  children,
  variant = 'gold',
  to,
  href,
  type = 'button',
  onClick,
  className = '',
  disabled,
  ariaLabel,
}: ButtonProps) {
  const cls = `${variant === 'gold' ? 'btn-gold' : 'btn-outline'} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={cls} aria-label={ariaLabel} onClick={onClick}>
        {children}
      </Link>
    )
  }

  if (href) {
    const external = href.startsWith('http')
    return (
      <a
        href={href}
        className={cls}
        aria-label={ariaLabel}
        onClick={onClick}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  )
}
