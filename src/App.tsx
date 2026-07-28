import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { SettingsPage } from '@/pages/Settings'
import { Clients } from '@/pages/Clients'
import { Services } from '@/pages/Services'
import { Deals } from '@/pages/Deals'
import { Journal } from '@/pages/Journal'
import { Documents } from '@/pages/Documents'
import { TaxCard } from '@/pages/TaxCard'
import { Backup } from '@/pages/Backup'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="clients" element={<Clients />} />
          <Route path="services" element={<Services />} />
          <Route path="deals" element={<Deals />} />
          <Route path="journal" element={<Journal />} />
          <Route path="documents" element={<Documents />} />
          <Route path="tax-card" element={<TaxCard />} />
          <Route path="backup" element={<Backup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  )
}
