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
        <h1 style={{color:'#F7F0E8',fontSize:'22px',fontWeight:800,marginBottom:'4px'}}>Days Off</h1>
        <p style={{color:'rgba(247,240,232,0.45)',fontSize:'13px',marginBottom:'20px'}}>Request and track your days off</p>
      </div>
      <DayOffManager profile={profile} requests={requests || []}/>
    </div>
  )
}
