import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { DayOffManager } from '@/components/schedule/day-off-manager'

export default async function DaysOffPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: requests } = await supabase
    .from('day_off_requests')
    .select('*')
    .eq('staff_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#323232] tracking-tight">Days Off</h1>
        <p className="text-gray-500 text-sm mt-1">Request and track your days off</p>
      </div>
      <DayOffManager profile={profile} requests={requests || []}/>
    </div>
  )
}
