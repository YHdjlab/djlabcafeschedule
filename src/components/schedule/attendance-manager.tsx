'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogIn, LogOut, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  profile: any
  todayRecord: any
  recentAttendance: any[]
}

const STATUS_COLORS: Record<string, any> = {
  pending_approval: 'yellow',
  checked_in: 'green',
  checked_out: 'blue',
  rejected: 'red',
}

export function AttendanceManager({ profile, todayRecord: initial, recentAttendance }: Props) {
  const [todayRecord, setTodayRecord] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const now = new Date()
  const beirutOffset = 3 * 60
  const beirutTime = new Date(now.getTime() + beirutOffset * 60000)
  const hour = beirutTime.getUTCHours()
  const isWeekend = [0, 6].includes(beirutTime.getUTCDay())
  const isRush = isWeekend || (hour >= 15 && hour < 21)
  const timeStr = ${String(hour).padStart(2,'0')}:

  const checkIn = async () => {
    setLoading(true)
    setError('')
    const attId = 'ATT-' + Date.now()
    const today = beirutTime.toISOString().slice(0,10)

    const { data, error: err } = await supabase.from('attendance').insert({
      attendance_id: attId,
      staff_id: profile.id,
      date: today,
      checkin_time: timeStr,
      checkin_ts: new Date().toISOString(),
      shift_type: isRush ? 'rush' : 'off-rush',
      status: profile.role.startsWith('supervisor') ? 'checked_in' : 'pending_approval',
      attendance_flag: 'on_time',
    }).select().single()

    if (err) { setError(err.message); setLoading(false); return }
    setTodayRecord(data)
    setLoading(false)
  }

  const checkOut = async () => {
    if (!todayRecord) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from('attendance')
      .update({ checkout_time: timeStr, checkout_ts: new Date().toISOString(), status: 'checked_out' })
      .eq('id', todayRecord.id)
      .select().single()

    if (err) { setError(err.message); setLoading(false); return }
    setTodayRecord(data)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Today's Attendance</CardTitle></CardHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F7F0E8]">
            <Clock size={20} className="text-[#FF6357]"/>
            <div>
              <p className="text-sm font-medium text-[#323232]">Current time (Beirut)</p>
              <p className="text-2xl font-bold text-[#323232]">{timeStr}</p>
            </div>
            <div className="ml-auto">
              <Badge variant={isRush ? 'coral' : 'blue'}>{isRush ? 'Rush Hour' : 'Off-Rush'}</Badge>
            </div>
          </div>

          {!todayRecord ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-4">You haven't checked in today</p>
              <Button onClick={checkIn} loading={loading} size="lg" className="w-full max-w-xs">
                <LogIn size={18} className="mr-2"/>
                Check In
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F0E8]">
                <div>
                  <p className="text-xs text-gray-500">Check-in time</p>
                  <p className="font-semibold text-[#323232]">{todayRecord.checkin_time}</p>
                </div>
                <Badge variant={STATUS_COLORS[todayRecord.status]}>{todayRecord.status.replace('_',' ')}</Badge>
              </div>

              {todayRecord.checkout_time ? (
                <div className="p-3 rounded-xl bg-green-50">
                  <p className="text-xs text-gray-500">Checked out at</p>
                  <p className="font-semibold text-green-700">{todayRecord.checkout_time}</p>
                </div>
              ) : todayRecord.status === 'checked_in' ? (
                <Button onClick={checkOut} loading={loading} variant="secondary" size="lg" className="w-full">
                  <LogOut size={18} className="mr-2"/>
                  Check Out
                </Button>
              ) : (
                <p className="text-sm text-center text-gray-400">Awaiting supervisor approval</p>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Attendance</CardTitle></CardHeader>
        <div className="space-y-2">
          {recentAttendance.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">No attendance records yet</p>
          ) : recentAttendance.map(rec => (
            <div key={rec.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F7F0E8]">
              <div>
                <p className="text-sm font-medium text-[#323232]">{format(new Date(rec.date + 'T00:00:00'), 'EEE, MMM d')}</p>
                <p className="text-xs text-gray-500">
                  {rec.checkin_time} {rec.checkout_time ? –  : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant={rec.shift_type === 'rush' ? 'coral' : 'blue'}>{rec.shift_type}</Badge>
                <Badge variant={STATUS_COLORS[rec.status]}>{rec.status.replace('_',' ')}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
