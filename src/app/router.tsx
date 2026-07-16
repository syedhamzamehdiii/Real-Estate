import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { AboutPage } from '../features/about/AboutSection'
import { ContactPage } from '../features/contact/ContactPage'
import { HomePage } from '../features/home/HomePage'
import { ListingDetailPage } from '../features/listings/ListingDetail'
import { ListingsPage } from '../features/listings/ListingsPage'
import { BlogDetailPage, ResourcesPage } from '../features/resources/ResourcesPages'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="listings" element={<ListingsPage />} />
        <Route path="listings/:id" element={<ListingDetailPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="resources/:slug" element={<BlogDetailPage />} />
        <Route path="blogs" element={<Navigate to="/resources" replace />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
