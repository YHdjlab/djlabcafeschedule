import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { AttendanceManager } from '@/components/schedule/attendance-manager'

export default async function AttendancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const today = new Date().toISOString().slice(0,10)
  const { data: todayRecord } = await supabase.from('attendance').select('*').eq('staff_id', user.id).eq('date', today).single()
  const { data: recentAttendance } = await supabase.from('attendance').select('*').eq('staff_id', user.id).order('date', { ascending: false }).limit(14)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#323232]">Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Check in and out of your shifts</p>
      </div>
      <AttendanceManager profile={profile} todayRecord={todayRecord || null} recentAttendance={recentAttendance || []}/>
    </div>
  )
}
