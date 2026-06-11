import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  FileText,
  MapPin,
  Calculator,
  CalendarClock,
  AlertTriangle,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/waybill/create', label: '运单创建', icon: FileText },
  { path: '/tracking', label: '货物跟踪', icon: MapPin },
  { path: '/cost', label: '费用试算', icon: Calculator },
  { path: '/loading', label: '装卸预约', icon: CalendarClock },
  { path: '/exception', label: '异常协商', icon: AlertTriangle },
  { path: '/account', label: '账户中心', icon: UserCircle },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const notifications = useStore((s) => s.notifications)
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          'flex flex-col bg-rail-500 text-white transition-all duration-300 relative',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        <div className={cn('flex items-center h-16 px-4 border-b border-rail-400', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="w-8 h-8 rounded-lg bg-copper-500 flex items-center justify-center font-serif font-bold text-sm flex-shrink-0">
            铁
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-base font-serif font-semibold tracking-wide whitespace-nowrap">铁运通</h1>
              <p className="text-[10px] text-rail-200 whitespace-nowrap">铁路货运服务平台</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  isActive
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-rail-200 hover:bg-white/10 hover:text-white',
                  collapsed && 'justify-center px-0'
                )}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-rail-500 border border-rail-400 rounded-full flex items-center justify-center text-white hover:bg-rail-600 transition-colors z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-800">
            {navItems.find((i) => i.path === location.pathname)?.label || '铁运通'}
          </h2>
          <div className="flex items-center gap-4">
            <Link to="/" className="relative text-gray-400 hover:text-rail-500 transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rail-100 text-rail-500 flex items-center justify-center text-sm font-medium">
                华
              </div>
              <span className="text-sm text-gray-600">华北煤炭集团</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
