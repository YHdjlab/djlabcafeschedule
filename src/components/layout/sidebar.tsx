'use client'
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
  const isAdmin = ['gm', 'admin', 'supervisor_floor', 'supervisor_bar'].includes(profile.role)
  const nav = NAV.filter(n => !n.adminOnly || isAdmin)

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const Inner = () => (
    <div className="flex flex-col h-full" style={{backgroundColor: '#323232'}}>
      {/* Logo */}
      <div style={{padding: '24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(247,240,232,0.08)'}}>
        <img src="/images/logo.png" alt="DjLab Cafe" style={{height: '40px', width: 'auto', objectFit: 'contain'}}/>
      </div>
      {/* Profile */}
      <div style={{padding: '16px 12px', borderBottom: '1px solid rgba(247,240,232,0.08)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', backgroundColor: 'rgba(247,240,232,0.07)'}}>
          <div style={{width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FF6357', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <span style={{color: 'white', fontSize: '14px', fontWeight: '700'}}>{profile.full_name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div style={{minWidth: 0}}>
            <p style={{color: '#F7F0E8', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{profile.full_name}</p>
            <p style={{color: 'rgba(247,240,232,0.4)', fontSize: '11px', textTransform: 'capitalize'}}>{profile.role.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav style={{flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px'}}>
        {nav.map(item => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '14px',
                fontSize: '13px', fontWeight: active ? '600' : '500',
                color: active ? '#F7F0E8' : 'rgba(247,240,232,0.45)',
                backgroundColor: active ? '#FF6357' : 'transparent',
                transition: 'all 0.15s', textDecoration: 'none',
                boxShadow: active ? '0 2px 8px rgba(255,99,87,0.35)' : 'none',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(247,240,232,0.08)'; (e.currentTarget as HTMLElement).style.color = '#F7F0E8' }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(247,240,232,0.45)' } }}
            >
              <Icon size={16} style={{flexShrink: 0}}/>
              {item.label}
            </Link>
          )
        })}
      </nav>
      {/* Sign out */}
      <div style={{padding: '12px', borderTop: '1px solid rgba(247,240,232,0.08)'}}>
        <button onClick={signOut} style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '14px', fontSize: '13px', fontWeight: '500', color: 'rgba(247,240,232,0.35)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', width: '100%', transition: 'all 0.15s'}}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,99,87,0.12)'; (e.currentTarget as HTMLElement).style.color = '#FF6357' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(247,240,232,0.35)' }}>
          <LogOut size={16} style={{flexShrink: 0}}/>
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button onClick={() => setOpen(!open)} className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-2xl shadow-lg flex items-center justify-center" style={{backgroundColor: '#323232', border: '1px solid rgba(247,240,232,0.1)', color: '#F7F0E8'}}>
        {open ? <X size={18}/> : <Menu size={18}/>}
      </button>
      {open && <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setOpen(false)}/>}
      <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-full w-60 z-30">
        <Inner/>
      </aside>
      <aside className={cn('lg:hidden fixed left-0 top-0 h-full w-64 z-50 transition-transform duration-300', open ? 'translate-x-0' : '-translate-x-full')}>
        <Inner/>
      </aside>
    </>
  )
}
