'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, X } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  profile: any
  requests: any[]
}

const STATUS_COLORS: Record<string, any> = {
  pending_supervisor: 'yellow',
  pending_gm: 'yellow',
  approved: 'green',
  denied: 'red',
}

const STATUS_LABELS: Record<string, string> = {
  pending_supervisor: 'Pending Supervisor',
  pending_gm: 'Pending GM',
  approved: 'Approved',
  denied: 'Denied',
}

export function DayOffManager({ profile, requests: initial }: Props) {
  const [requests, setRequests] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase.from('day_off_requests').insert({
      request_id: 'DO-' + Date.now(),
      staff_id: profile.id,
      date_off: date,
      reason,
      status: 'pending_supervisor',
    }).select().single()

    if (err) { setError(err.message); setLoading(false); return }
    setRequests(prev => [data, ...prev])
    setShowForm(false)
    setDate('')
    setReason('')
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div/>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? <><X size={14} className="mr-1.5"/>Cancel</> : <><Plus size={14} className="mr-1.5"/>Request Day Off</>}
        </Button>
      </div>

      {showForm && (
        <div style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'20px'}}>
          <CardHeader><CardTitle>New Day Off Request</CardTitle></CardHeader>
          <form onSubmit={submit} className="space-y-4">
            <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required min={new Date().toISOString().slice(0,10)}/>
            <Input label="Reason (optional)" value={reason} onChange={e => setReason(e.target.value)} placeholder="Brief reason..."/>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Submit Request</Button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {requests.length === 0 ? (
          <div style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'20px'}}>
            <p className="text-center text-gray-400 text-sm py-8">No day off requests yet</p>
          </div>
        ) : requests.map(req => (
          <div key={req.id} style={{backgroundColor:'#242424',borderRadius:'14px',border:'1px solid rgba(255,255,255,0.08)',padding:'16px'}}>
            <div className="flex items-center justify-between p-1">
              <div>
                <p style={{color:'#F7F0E8',fontSize:'14px',fontWeight:600}}>
                  {format(new Date(req.date_off + 'T00:00:00'), 'EEEE, MMM d yyyy')}
                </p>
                {req.reason && <p style={{color:'rgba(247,240,232,0.45)',fontSize:'12px',marginTop:'2px'}}>{req.reason}</p>}
                <p style={{color:'rgba(247,240,232,0.3)',fontSize:'11px',marginTop:'4px'}}>
                  Submitted {format(new Date(req.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <Badge variant={STATUS_COLORS[req.status]}>{STATUS_LABELS[req.status]}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
