'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Check } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  profile: any
  swapRequests: any[]
  staff: any[]
  schedules: any[]
}

const STATUS_COLORS: Record<string, any> = {
  pending_staff_b: 'yellow',
  pending_supervisor: 'yellow',
  approved: 'green',
  denied: 'red',
}

export function SwapManager({ profile, swapRequests: initial, staff, schedules }: Props) {
  const [swaps, setSwaps] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ staffBId: '', shiftDate: '', shiftLabel: '' })
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const supabase = createClient()

  const isAdmin = ['gm', 'supervisor'].includes(profile.role)

  const staffOptions = staff
    .filter(s => s.id !== profile.id)
    .map(s => ({ value: s.id, label: s.full_name + ' (' + s.role.replace('_',' ') + ')' }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const staffB = staff.find(s => s.id === form.staffBId)
    const myRole = profile.role
    const theirRole = staffB?.role
    const floorRoles = ['floor', 'supervisor']
    const barRoles = ['bar', 'supervisor']
    const myGroup = floorRoles.includes(myRole) ? 'floor' : 'bar'
    const theirGroup = floorRoles.includes(theirRole) ? 'floor' : 'bar'

    if (myGroup !== theirGroup) {
      setError('You can only swap with staff of the same type (floor?floor, bar?bar)')
      setLoading(false)
      return
    }

    const { data, error: err } = await supabase.from('swap_requests').insert({
      swap_id: 'SWP-' + Date.now(),
      staff_a_id: profile.id,
      staff_b_id: form.staffBId,
      shift_date: form.shiftDate,
      shift_label: form.shiftLabel || 'Shift',
      status: 'pending_staff_b',
    }).select("*, staff_a:staff_a_id(full_name), staff_b:staff_b_id(full_name)").single()

    if (err) { setError(err.message); setLoading(false); return }
    setSwaps(prev => [data, ...prev])
    setShowForm(false)
    setForm({ staffBId: '', shiftDate: '', shiftLabel: '' })
    setLoading(false)
  }

  const respond = async (swapId: string, id: string, action: 'accept' | 'decline' | 'approve' | 'deny') => {
    setActionLoading(id + action)
    const status = action === 'accept' ? 'pending_supervisor' : action === 'approve' ? 'approved' : 'denied'
    const { data } = await supabase
      .from('swap_requests')
      .update({ status, resolved_at: ['approved','denied'].includes(status) ? new Date().toISOString() : null })
      .eq('id', id)
      .select("*, staff_a:staff_a_id(full_name), staff_b:staff_b_id(full_name)").single()
    if (data) setSwaps(prev => prev.map(s => s.id === id ? data : s))
    setActionLoading(null)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? <><X size={14} className="mr-1.5"/>Cancel</> : <><Plus size={14} className="mr-1.5"/>Request Swap</>}
        </Button>
      </div>

      {showForm && (
        <div style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'20px'}}>
          <CardHeader><CardTitle>New Swap Request</CardTitle></CardHeader>
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <Select
              label="Swap with"
              value={form.staffBId}
              onChange={e => setForm(p => ({...p, staffBId: e.target.value}))}
              options={[{value:'',label:'Select staff member...'}, ...staffOptions]}
              required
            />
            <Input
              label="Shift date"
              type="date"
              value={form.shiftDate}
              onChange={e => setForm(p => ({...p, shiftDate: e.target.value}))}
              required
              min={new Date().toISOString().slice(0,10)}
            />
            <Input
              label="Shift label"
              value={form.shiftLabel}
              onChange={e => setForm(p => ({...p, shiftLabel: e.target.value}))}
              placeholder="e.g. Rush 3pm-9pm"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Submit Request</Button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {swaps.length === 0 ? (
          <div style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'20px'}}><p className="text-center text-gray-400 text-sm py-8">No swap requests</p></div>
        ) : swaps.map(swap => {
          const isStaffB = swap.staff_b_id === profile.id
          const canRespond = isStaffB && swap.status === 'pending_staff_b'
          const canApprove = isAdmin && swap.status === 'pending_supervisor'

          return (
            <div key={swap.id} style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'16px'}}>
              <div className="p-2 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p style={{color:'#F7F0E8',fontSize:'14px',fontWeight:600}}>
                      {swap.staff_a?.full_name} ? {swap.staff_b?.full_name}
                    </p>
                    <p style={{color:'rgba(247,240,232,0.45)',fontSize:'12px',marginTop:'2px'}}>
                      {swap.shift_date && format(new Date(swap.shift_date + 'T00:00:00'), 'EEE MMM d')}
                      {swap.shift_label && " - " + swap.shift_label}
                    </p>
                  </div>
                  <Badge variant={STATUS_COLORS[swap.status]}>
                    {swap.status.replace(/_/g,' ')}
                  </Badge>
                </div>

                {(canRespond || canApprove) && (
                  <div className="flex gap-2">
                    <Button
                      size="sm" variant="primary"
                      loading={actionLoading === swap.id + (canRespond ? 'accept' : 'approve')}
                      onClick={() => respond(swap.swap_id, swap.id, canRespond ? 'accept' : 'approve')}
                      className="flex-1"
                    >
                      <Check size={14} className="mr-1"/>{canRespond ? 'Accept' : 'Approve'}
                    </Button>
                    <Button
                      size="sm" variant="danger"
                      loading={actionLoading === swap.id + (canRespond ? 'decline' : 'deny')}
                      onClick={() => respond(swap.swap_id, swap.id, canRespond ? 'decline' : 'deny')}
                      className="flex-1"
                    >
                      <X size={14} className="mr-1"/>{canRespond ? 'Decline' : 'Deny'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
