'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, AlertCircle, User } from 'lucide-react'

export function PasswordChange({ profile }: { profile: any }) {
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (newPass.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPass !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    // Re-authenticate with current password first
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: profile.email, password: current })
    if (signInError) { setError('Current password is incorrect'); setLoading(false); return }
    // Update password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPass })
    if (updateError) { setError(updateError.message); setLoading(false); return }
    setSuccess(true)
    setCurrent(''); setNewPass(''); setConfirm('')
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'20px'}}>
        <p style={{color:'rgba(247,240,232,0.45)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'14px'}}>Your Profile</p>
        <div className="flex items-center gap-4 p-1">
          <div className="w-14 h-14 rounded-full bg-[#323232] flex items-center justify-center">
            <span className="text-white text-xl font-bold">{profile.full_name?.charAt(0)}</span>
          </div>
          <div>
            <p style={{color:'#F7F0E8',fontSize:'16px',fontWeight:700}}>{profile.full_name}</p>
            <p style={{color:'rgba(247,240,232,0.45)',fontSize:'12px'}}>{profile.email}</p>
            <p style={{color:'#FF6357',fontSize:'11px',fontWeight:600,marginTop:'2px',textTransform:'capitalize'}}>{profile.role?.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>

      <div style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'20px'}}>
        <p style={{color:'rgba(247,240,232,0.45)',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'14px'}}>Change Password</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            placeholder="Your current password"
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            placeholder="At least 6 characters"
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat new password"
            required
          />
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0"/>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-2xl">
              <Check size={14} className="text-green-500 flex-shrink-0"/>
              <p className="text-sm text-green-600 font-medium">Password changed successfully!</p>
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Update Password
          </Button>
        </form>
      </div>
    </div>
  )
}
