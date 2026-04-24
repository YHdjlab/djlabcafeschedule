'use client'
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
