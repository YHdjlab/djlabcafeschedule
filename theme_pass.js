const fs = require("fs");

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
fs.writeFileSync("src/components/layout/sidebar.tsx", `'use client'
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
`);
console.log("sidebar.tsx done");

// ─── LOGIN ────────────────────────────────────────────────────────────────────
fs.writeFileSync("src/app/(auth)/login/page.tsx", `'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{backgroundColor: '#2d2d2d', borderRadius: '28px', padding: '36px', border: '1px solid rgba(247,240,232,0.08)', boxShadow: '0 32px 64px rgba(0,0,0,0.5)'}}>
      <h2 style={{color: '#F7F0E8', fontSize: '24px', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.02em'}}>Welcome back</h2>
      <p style={{color: 'rgba(247,240,232,0.35)', fontSize: '14px', marginBottom: '32px'}}>Sign in to your account</p>
      <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        <div>
          <label style={{color: 'rgba(247,240,232,0.55)', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em'}}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@djlab.com" required autoComplete="email"
            style={{width: '100%', padding: '14px 16px', borderRadius: '16px', border: '1.5px solid rgba(247,240,232,0.1)', backgroundColor: 'rgba(247,240,232,0.05)', color: '#F7F0E8', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s'}}
            onFocus={e => e.target.style.borderColor = '#FF6357'} onBlur={e => e.target.style.borderColor = 'rgba(247,240,232,0.1)'}/>
        </div>
        <div>
          <label style={{color: 'rgba(247,240,232,0.55)', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em'}}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password"
            style={{width: '100%', padding: '14px 16px', borderRadius: '16px', border: '1.5px solid rgba(247,240,232,0.1)', backgroundColor: 'rgba(247,240,232,0.05)', color: '#F7F0E8', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s'}}
            onFocus={e => e.target.style.borderColor = '#FF6357'} onBlur={e => e.target.style.borderColor = 'rgba(247,240,232,0.1)'}/>
        </div>
        {error && <div style={{padding: '12px 16px', borderRadius: '14px', backgroundColor: 'rgba(255,99,87,0.12)', border: '1px solid rgba(255,99,87,0.25)', color: '#FF6357', fontSize: '13px'}}>{error}</div>}
        <button type="submit" disabled={loading}
          style={{width: '100%', padding: '15px', borderRadius: '16px', backgroundColor: '#FF6357', color: '#F7F0E8', fontWeight: '700', fontSize: '15px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'all 0.15s', marginTop: '4px', letterSpacing: '-0.01em', boxShadow: '0 4px 16px rgba(255,99,87,0.4)'}}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p style={{textAlign: 'center', color: 'rgba(247,240,232,0.3)', fontSize: '13px', marginTop: '28px'}}>
        {"Don't have an account? "}
        <a href="/register" style={{color: '#FF6357', fontWeight: '600', textDecoration: 'none'}}>Register</a>
      </p>
    </div>
  )
}
`);
console.log("login.tsx done");

// ─── AUTH LAYOUT ──────────────────────────────────────────────────────────────
fs.writeFileSync("src/app/(auth)/layout.tsx", `export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{minHeight: '100vh', backgroundColor: '#1e1e1e', backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(255,99,87,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(50,50,50,0.8) 0%, transparent 60%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
      <div style={{width: '100%', maxWidth: '400px'}}>
        <div style={{textAlign: 'center', marginBottom: '36px'}}>
          <div style={{backgroundColor: '#323232', borderRadius: '24px', padding: '20px 36px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(247,240,232,0.08)'}}>
            <img src="/images/logo.png" alt="DjLab Cafe" style={{height: '44px', width: 'auto'}}/>
          </div>
          <p style={{color: 'rgba(247,240,232,0.25)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '600'}}>Schedule Management</p>
        </div>
        {children}
      </div>
    </div>
  )
}
`);
console.log("auth layout done");

// ─── GLOBALS ──────────────────────────────────────────────────────────────────
fs.writeFileSync("src/app/globals.css", `@import 'tailwindcss';

@theme {
  --color-brand-dark: #323232;
  --color-brand-cream: #F7F0E8;
  --color-brand-coral: #FF6357;
}

*, *::before, *::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  background-color: #F7F0E8;
  color: #323232;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:root {
  --brand-dark: #323232;
  --brand-cream: #F7F0E8;
  --brand-coral: #FF6357;
}

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`);
console.log("globals.css done");

console.log("\nAll color theme files done!");
