'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    <div style={{backgroundColor:'#2a2a2a', borderRadius:'24px', padding:'32px', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 25px 50px rgba(0,0,0,0.5)'}}>
      <h2 style={{color:'white', fontSize:'22px', fontWeight:'700', marginBottom:'4px'}}>Welcome back</h2>
      <p style={{color:'rgba(255,255,255,0.4)', fontSize:'14px', marginBottom:'28px'}}>Sign in to your account</p>
      <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap:'16px'}}>
        <div>
          <label style={{color:'rgba(255,255,255,0.6)', fontSize:'13px', fontWeight:'500', display:'block', marginBottom:'6px'}}>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@djlab.com" required autoComplete="email"
            style={{width:'100%', padding:'12px 16px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', backgroundColor:'rgba(255,255,255,0.06)', color:'white', fontSize:'14px', outline:'none', boxSizing:'border-box'}}
            onFocus={e => e.target.style.borderColor='#FF6357'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
        </div>
        <div>
          <label style={{color:'rgba(255,255,255,0.6)', fontSize:'13px', fontWeight:'500', display:'block', marginBottom:'6px'}}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required autoComplete="current-password"
            style={{width:'100%', padding:'12px 16px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', backgroundColor:'rgba(255,255,255,0.06)', color:'white', fontSize:'14px', outline:'none', boxSizing:'border-box'}}
            onFocus={e => e.target.style.borderColor='#FF6357'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}/>
        </div>
        {error && <div style={{padding:'12px 16px', borderRadius:'12px', backgroundColor:'rgba(255,99,87,0.15)', border:'1px solid rgba(255,99,87,0.3)', color:'#FF6357', fontSize:'13px'}}>{error}</div>}
        <button type="submit" disabled={loading}
          style={{width:'100%', padding:'14px', borderRadius:'12px', backgroundColor:'#FF6357', color:'white', fontWeight:'700', fontSize:'15px', border:'none', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, transition:'all 0.2s', marginTop:'4px'}}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p style={{textAlign:'center', color:'rgba(255,255,255,0.35)', fontSize:'13px', marginTop:'24px'}}>
        {"Don't have an account? "}
        <a href="/register" style={{color:'#FF6357', fontWeight:'600', textDecoration:'none'}}>Register</a>
      </p>
    </div>
  )
}