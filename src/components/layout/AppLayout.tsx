import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Handshake,
  BookOpen,
  FileText,
  Receipt,
  DatabaseBackup,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCrmStore } from '@/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard },
  { to: '/settings', label: 'Исполнитель', icon: Settings },
  { to: '/clients', label: 'Заказчики', icon: Users },
  { to: '/services', label: 'Услуги', icon: Briefcase },
  { to: '/deals', label: 'Сделки', icon: Handshake },
  { to: '/journal', label: 'Журнал', icon: BookOpen },
  { to: '/documents', label: 'Документы', icon: FileText },
  { to: '/tax-card', label: 'Мой налог', icon: Receipt },
  { to: '/backup', label: 'Резервная копия', icon: DatabaseBackup },
]

export function AppLayout() {
  const theme = useCrmStore((s) => s.settings.theme)
  const setTheme = useCrmStore((s) => s.setTheme)
  const contractor = useCrmStore((s) => s.contractor)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const NavItems = (
    <nav className="flex flex-col gap-1.5">
      {nav.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow'
                  : 'text-[var(--color-sidebar-foreground)] hover:bg-white/10',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-white/10 bg-[var(--color-sidebar)] p-4 text-[var(--color-sidebar-foreground)] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="mb-6 rounded-2xl bg-white/5 p-4">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-300">
            Energy CRM
          </div>
          <div className="mt-2 text-lg font-extrabold leading-tight">Локальная база</div>
          <div className="mt-2 line-clamp-2 text-xs text-slate-400">{contractor.fullName}</div>
        </div>
        <div className="flex-1 overflow-auto">{NavItems}</div>
        <Button
          variant="secondary"
          className="mt-4 w-full justify-start"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        </Button>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-card)]/80 px-4 py-3 backdrop-blur lg:hidden">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-500">Energy CRM</div>
            <div className="text-sm font-semibold">Локальная база</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        {mobileOpen ? (
          <div className="border-b border-[var(--color-border)] bg-[var(--color-sidebar)] p-4 lg:hidden">
            {NavItems}
          </div>
        ) : null}

        <main className="animate-fade-in p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
