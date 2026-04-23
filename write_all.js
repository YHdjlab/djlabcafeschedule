const fs = require("fs");

// 1. Fix sidebar - use actual logo with dark background
const sidebar = `'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Calendar, Clock, ArrowLeftRight, CalendarOff, CheckSquare, Settings, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { Profile } from '@/types'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/availability', label: 'Availability', icon: Clock },
  { href: '/swaps', label: 'Swaps', icon: ArrowLeftRight },
  { href: '/days-off', label: 'Days Off', icon: CalendarOff },
  { href: '/attendance', label: 'Attendance', icon: CheckSquare },
  { href: '/admin', label: 'Admin', icon: Settings, adminOnly: true },
]

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const isAdmin = ['gm', 'supervisor_floor', 'supervisor_bar'].includes(profile.role)
  const nav = NAV.filter(n => !n.adminOnly || isAdmin)

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const Inner = () => (
    <div className="flex flex-col h-full bg-white border-r border-black/5">
      <div className="p-5 border-b border-black/5" style={{backgroundColor: '#323232'}}>
        <img src="/images/logo.png" alt="DjLab Cafe" style={{height: '40px', width: 'auto'}}/>
      </div>
      <div className="p-3 border-b border-black/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F0E8]">
          <div className="w-8 h-8 rounded-full bg-[#323232] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{profile.full_name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#323232] truncate">{profile.full_name}</p>
            <p className="text-xs text-gray-400 capitalize">{profile.role.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'bg-[#FF6357] text-white shadow-sm' : 'text-gray-500 hover:bg-[#F7F0E8] hover:text-[#323232]'
              )}>
              <Icon size={17} className="flex-shrink-0"/>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-black/5">
        <button onClick={signOut} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all w-full">
          <LogOut size={17} className="flex-shrink-0"/>
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button onClick={() => setOpen(!open)} className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-md border border-black/5 flex items-center justify-center">
        {open ? <X size={18}/> : <Menu size={18}/>}
      </button>
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={() => setOpen(false)}/>
      )}
      <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-full w-60 z-30">
        <Inner/>
      </aside>
      <aside className={cn('lg:hidden fixed left-0 top-0 h-full w-64 z-50 transition-transform duration-300', open ? 'translate-x-0' : '-translate-x-full')}>
        <Inner/>
      </aside>
    </>
  )
}`;

// 2. Fix layout - single main with guaranteed padding
const layout = `import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/login")
  return (
    <div className="min-h-screen bg-[#F7F0E8]">
      <Sidebar profile={profile}/>
      <main style={{paddingLeft: "240px"}} className="min-h-screen hidden lg:block">
        <div style={{padding: "32px"}}>{children}</div>
      </main>
      <main className="min-h-screen lg:hidden">
        <div style={{padding: "72px 16px 32px"}}>{children}</div>
      </main>
    </div>
  )
}`;

fs.writeFileSync("src/components/layout/sidebar.tsx", sidebar, "utf8");
console.log("sidebar written");
fs.writeFileSync("src/app/(dashboard)/layout.tsx", layout, "utf8");
console.log("layout written");
