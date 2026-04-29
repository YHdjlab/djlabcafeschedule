import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { AvailabilityGrid } from '@/components/schedule/availability-grid'
import { getNextMonday, getCurrentWeekMonday } from '@/lib/utils'
export default async function AvailabilityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  const nextMonday = getNextMonday()
  const currentMonday = getCurrentWeekMonday()
  const [{ data: availability }, { data: rushConfig }, { data: schedules }] = await Promise.all([
    supabase.from('availability').select('*').eq('staff_id', user.id).gte('week_starting', currentMonday),
    supabase.from('rush_hour_config').select('*'),
    supabase.from('schedules').select('*').gte('slot_date', currentMonday).or('supervisor_id.eq.'+user.id+',bar_staff_id.eq.'+user.id+',floor_staff1_id.eq.'+user.id+',floor_staff2_id.eq.'+user.id),
  ])
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
      <div>
        <h1 style={{color:'#F7F0E8',fontSize:'22px',fontWeight:800,marginBottom:'4px'}}>My Availability</h1>
        <p style={{color:'rgba(247,240,232,0.45)',fontSize:'13px'}}>Tap hours you cannot work. Everything else is available for scheduling.</p>
      </div>
      <AvailabilityGrid profile={profile} availability={availability||[]} schedules={schedules||[]} nextMonday={nextMonday} currentMonday={currentMonday} rushConfig={rushConfig||[]}/>
    </div>
  )
}