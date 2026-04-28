'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Calendar, Clock, ArrowLeftRight, CalendarOff, CheckSquare, Settings, LogOut, User, ChevronDown, Menu, X } from 'lucide-react'
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
  { href: '/settings', label: 'Settings', icon: User },
  { href: '/admin', label: 'Admin', icon: Settings, adminOnly: true },
]

export function Navbar({ profile }: { profile: Profile }) {
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

  return (
    <>
      {/* Top bar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '64px', zIndex: 50,
        backgroundColor: '#323232', borderBottom: '1px solid rgba(247,240,232,0.08)',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: '8px',
      }}>
        {/* Logo */}
        <Link href="/dashboard" style={{display:'flex',alignItems:'center',marginRight:'8px',flexShrink:0}}>
          <img src="/images/logo.png" alt="DjLab" style={{height:'32px',width:'auto'}}/>
        </Link>

        {/* Nav links - desktop */}
        <div style={{display:'flex',alignItems:'center',gap:'2px',flex:1,overflowX:'auto'}} className="hidden lg:flex scrollbar-hide">
          {nav.map(item => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} style={{
                display:'flex', alignItems:'center', gap:'6px',
                padding:'7px 12px', borderRadius:'10px',
                fontSize:'13px', fontWeight: active ? '600' : '500',
                color: active ? '#F7F0E8' : 'rgba(247,240,232,0.5)',
                backgroundColor: active ? '#FF6357' : 'transparent',
                textDecoration:'none', whiteSpace:'nowrap', flexShrink:0,
                transition:'all 0.15s',
              }}>
                <Icon size={14} style={{flexShrink:0}}/>
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Profile + signout - desktop */}
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginLeft:'auto',flexShrink:0}} className="hidden lg:flex">
          <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 10px',borderRadius:'10px',backgroundColor:'rgba(247,240,232,0.07)'}}>
            <div style={{width:'28px',height:'28px',borderRadius:'50%',backgroundColor:'#FF6357',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span style={{color:'white',fontSize:'12px',fontWeight:'700'}}>{profile.full_name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <span style={{color:'#F7F0E8',fontSize:'13px',fontWeight:'600'}}>{profile.full_name?.split(' ')[0]}</span>
          </div>
          <button onClick={signOut} style={{
            display:'flex',alignItems:'center',gap:'6px',padding:'7px 12px',borderRadius:'10px',
            fontSize:'13px',fontWeight:'500',color:'rgba(247,240,232,0.4)',
            backgroundColor:'transparent',border:'none',cursor:'pointer',transition:'all 0.15s',
          }}>
            <LogOut size={14}/>
          </button>
        </div>

        {/* Hamburger - mobile */}
        <button onClick={() => setOpen(!open)} className="lg:hidden" style={{
          marginLeft:'auto', display:'flex', alignItems:'center', justifyContent:'center',
          width:'36px', height:'36px', borderRadius:'10px',
          backgroundColor:'rgba(247,240,232,0.1)', border:'none', cursor:'pointer', color:'#F7F0E8',
        }}>
          {open ? <X size={18}/> : <Menu size={18}/>}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <>
          <div className="lg:hidden" onClick={() => setOpen(false)} style={{
            position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:40, top:'64px',
          }}/>
          <div className="lg:hidden" style={{
            position:'fixed', top:'64px', left:0, right:0, zIndex:50,
            backgroundColor:'#323232', borderBottom:'1px solid rgba(247,240,232,0.08)',
            padding:'8px', display:'flex', flexDirection:'column', gap:'2px',
          }}>
            {nav.map(item => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  padding:'12px 16px', borderRadius:'12px',
                  fontSize:'14px', fontWeight: active ? '600' : '500',
                  color: active ? '#F7F0E8' : 'rgba(247,240,232,0.6)',
                  backgroundColor: active ? '#FF6357' : 'transparent',
                  textDecoration:'none',
                }}>
                  <Icon size={16} style={{flexShrink:0}}/>
                  {item.label}
                </Link>
              )
            })}
            <button onClick={signOut} style={{
              display:'flex', alignItems:'center', gap:'10px',
              padding:'12px 16px', borderRadius:'12px',
              fontSize:'14px', fontWeight:'500', color:'rgba(247,240,232,0.4)',
              backgroundColor:'transparent', border:'none', cursor:'pointer',
              marginTop:'4px', borderTop:'1px solid rgba(247,240,232,0.08)',
            }}>
              <LogOut size={16}/>Sign Out
            </button>
          </div>
        </>
      )}
    </>
  )
}
