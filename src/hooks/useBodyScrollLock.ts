import { useEffect } from 'react'

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.classList.add('menu-open')
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.classList.remove('menu-open')
      document.body.style.overflow = prev
    }
  }, [locked])
}
