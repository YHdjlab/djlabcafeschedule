'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

const ROLE_OPTIONS = [
  { value: 'floor', label: 'Floor Staff' },
  { value: 'bar', label: 'Bar Staff' },
  { value: 'supervisor_floor', label: 'Supervisor (Floor)' },
  { value: 'supervisor_bar', label: 'Supervisor (Bar)' },
  { value: 'gm', label: 'General Manager' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', role: 'floor', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <Card className='shadow-xl border-0'>
      <h2 className='text-xl font-bold text-[#323232] mb-1'>Create account</h2>
      <p className='text-sm text-gray-500 mb-6'>Join the DjLab team</p>
      <form onSubmit={handleRegister} className='space-y-4'>
        <Input label='Full name' value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder='Your full name' required/>
        <Input label='Email address' type='email' value={form.email} onChange={e => update('email', e.target.value)} placeholder='you@djlab.com' required/>
        <Input label='Phone number' type='tel' value={form.phone} onChange={e => update('phone', e.target.value)} placeholder='+961 XX XXX XXX'/>
        <Select label='Your role' value={form.role} onChange={e => update('role', e.target.value)} options={ROLE_OPTIONS}/>
        <Input label='Password' type='password' value={form.password} onChange={e => update('password', e.target.value)} placeholder='Min. 6 characters' required/>
        <Input label='Confirm password' type='password' value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder='Repeat password' required/>
        {error && <div className='p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600'>{error}</div>}
        <Button type='submit' loading={loading} className='w-full' size='lg'>Create Account</Button>
      </form>
      <p className='text-center text-sm text-gray-500 mt-6'>
        Already have an account? <Link href='/login' className='text-[#FF6357] font-medium hover:underline'>Sign in</Link>
      </p>
    </Card>
  )
}
