import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { AboutPage } from '../features/about/AboutSection'
import { AdminDashboard } from '../features/admin/AdminDashboard'
import { AdminLayout } from '../features/admin/AdminLayout'
import { AdminLoginPage } from '../features/admin/AdminLogin'
import { AdminResourcesDashboard } from '../features/admin/AdminResourcesDashboard'
import { AdminResponses } from '../features/admin/AdminResponses'
import {
  AdminListingCreatePage,
  AdminListingEditPage,
} from '../features/admin/ListingForm'
import {
  AdminResourceCreatePage,
  AdminResourceEditPage,
} from '../features/admin/ResourceForm'
import { RequireAuth } from '../features/admin/RequireAuth'
import { ContactPage } from '../features/contact/ContactPage'
import { HomePage } from '../features/home/HomePage'
import { ListingDetailPage } from '../features/listings/ListingDetail'
import { ListingsPage } from '../features/listings/ListingsPage'
import { BlogDetailPage, ResourcesPage } from '../features/resources/ResourcesPages'

export function AppRouter() {
  return (
    <Routes>
      <Route path="admin/login" element={<AdminLoginPage />} />

      <Route
        path="admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="listings/new" element={<AdminListingCreatePage />} />
        <Route path="listings/:id/edit" element={<AdminListingEditPage />} />
        <Route path="resources" element={<AdminResourcesDashboard />} />
        <Route path="resources/new" element={<AdminResourceCreatePage />} />
        <Route path="resources/:id/edit" element={<AdminResourceEditPage />} />
        <Route path="responses" element={<AdminResponses />} />
      </Route>

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
