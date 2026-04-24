'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

const ROLE_OPTIONS = [
  { value: 'floor', label: 'Floor Staff' },
  { value: 'bar', label: 'Bar Staff' },
  { value: 'supervisor_floor', label: 'Supervisor (Floor)' },
  { value: 'supervisor_bar', label: 'Supervisor (Bar)' },
  { value: 'admin', label: 'Admin' },
  { value: 'gm', label: 'General Manager' },
]

const inputStyle = {width:'100%', padding:'12px 16px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', backgroundColor:'rgba(255,255,255,0.06)', color:'white', fontSize:'14px', outline:'none', boxSizing:'border-box' as const}
const labelStyle = {color:'rgba(255,255,255,0.6)', fontSize:'13px', fontWeight:'500' as const, display:'block' as const, marginBottom:'6px'}

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName:'', email:'', password:'', confirmPassword:'', role:'floor', phone:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password, fullName: form.fullName, role: form.role, phone: form.phone })
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (signInError) { setError(signInError.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{backgroundColor:'#2a2a2a', borderRadius:'24px', padding:'32px', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 25px 50px rgba(0,0,0,0.5)'}}>
      <h2 style={{color:'white', fontSize:'22px', fontWeight:'700', marginBottom:'4px'}}>Create account</h2>
      <p style={{color:'rgba(255,255,255,0.4)', fontSize:'14px', marginBottom:'28px'}}>Join the DjLab team</p>
      <form onSubmit={handleRegister} style={{display:'flex', flexDirection:'column', gap:'14px'}}>
        <div><label style={labelStyle}>Full name</label>
          <input value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Your full name" required style={inputStyle}
            onFocus={e => e.target.style.borderColor='#FF6357'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}/></div>
        <div><label style={labelStyle}>Email address</label>
          <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@djlab.com" required style={inputStyle}
            onFocus={e => e.target.style.borderColor='#FF6357'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}/></div>
        <div><label style={labelStyle}>Phone number</label>
          <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+961 XX XXX XXX" style={inputStyle}
            onFocus={e => e.target.style.borderColor='#FF6357'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}/></div>
        <div><label style={labelStyle}>Your role</label>
          <select value={form.role} onChange={e => update('role', e.target.value)}
            style={{...inputStyle, appearance:'none' as const}}>
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value} style={{backgroundColor:'#2a2a2a'}}>{o.label}</option>)}
          </select></div>
        <div><label style={labelStyle}>Password</label>
          <input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min. 6 characters" required style={inputStyle}
            onFocus={e => e.target.style.borderColor='#FF6357'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}/></div>
        <div><label style={labelStyle}>Confirm password</label>
          <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Repeat password" required style={inputStyle}
            onFocus={e => e.target.style.borderColor='#FF6357'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}/></div>
        {error && <div style={{padding:'12px 16px', borderRadius:'12px', backgroundColor:'rgba(255,99,87,0.15)', border:'1px solid rgba(255,99,87,0.3)', color:'#FF6357', fontSize:'13px'}}>{error}</div>}
        <button type="submit" disabled={loading}
          style={{width:'100%', padding:'14px', borderRadius:'12px', backgroundColor:'#FF6357', color:'white', fontWeight:'700', fontSize:'15px', border:'none', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, marginTop:'4px'}}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p style={{textAlign:'center', color:'rgba(255,255,255,0.35)', fontSize:'13px', marginTop:'24px'}}>
        Already have an account? <a href="/login" style={{color:'#FF6357', fontWeight:'600', textDecoration:'none'}}>Sign in</a>
      </p>
    </div>
  )
}