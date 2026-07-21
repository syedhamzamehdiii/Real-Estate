import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { FloatingContact } from './FloatingContact'
import { Footer } from './Footer'
import { Header } from './Header'
import { ScrollRiver } from './ScrollRiver'

export function AppLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="page">
      <ScrollRiver />
      <Header />
      <main className="page-main">
        <Outlet />
      </main>
      <Footer />
      <FloatingContact />
    </div>
  )
}
