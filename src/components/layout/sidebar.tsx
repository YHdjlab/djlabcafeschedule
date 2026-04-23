'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Calendar, Clock, ArrowLeftRight,
  CalendarOff, CheckSquare, Settings, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  adminOnly?: boolean
  gmOnly?: boolean
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18}/> },
  { href: '/schedule', label: 'Schedule', icon: <Calendar size={18}/> },
  { href: '/availability', label: 'My Availability', icon: <Clock size={18}/> },
  { href: '/swaps', label: 'Shift Swaps', icon: <ArrowLeftRight size={18}/> },
  { href: '/days-off', label: 'Days Off', icon: <CalendarOff size={18}/> },
  { href: '/attendance', label: 'Attendance', icon: <CheckSquare size={18}/> },
  { href: '/admin', label: 'Admin Panel', icon: <Settings size={18}/>, adminOnly: true },
]

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isAdmin = ['gm', 'supervisor_floor', 'supervisor_bar'].includes(profile.role)
  const filteredNav = navItems.filter(item => {
    if (item.gmOnly && profile.role !== 'gm') return false
    if (item.adminOnly && !isAdmin) return false
    return true
  })

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF6357] flex items-center justify-center">
            <span className="text-white font-bold text-sm">DJ</span>
          </div>
          <div>
            <p className="font-bold text-[#323232] text-sm">DjLab Cafe</p>
            <p className="text-xs text-gray-400">Schedule System</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-black/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F0E8]">
          <div className="w-8 h-8 rounded-full bg-[#323232] flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {profile.full_name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#323232] truncate">{profile.full_name}</p>
            <p className="text-xs text-gray-400 capitalize">{profile.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredNav.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-[#FF6357] text-white font-medium shadow-sm'
                : 'text-gray-500 hover:bg-black/5 hover:text-[#323232]'
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-black/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all w-full"
        >
          <LogOut size={18}/>
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        'fixed left-0 top-0 h-full w-64 bg-white border-r border-black/5 z-40 transition-transform duration-300',
        'lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent/>
      </aside>
    </>
  )
}
