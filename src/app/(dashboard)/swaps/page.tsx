import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { SwapManager } from '@/components/schedule/swap-manager'

export default async function SwapsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  const isAdmin = ['gm','admin','supervisor_floor','supervisor_bar'].includes(profile.role)
  let swapsQuery = supabase
    .from('swap_requests')
    .select('*, staff_a:staff_a_id(id,full_name,role), staff_b:staff_b_id(id,full_name,role)')
    .order('created_at', { ascending: false })
  if (isAdmin) {
    swapsQuery = swapsQuery.in('status', ['pending_supervisor','approved','denied'])
  } else {
    swapsQuery = swapsQuery.or('staff_a_id.eq.' + user.id + ',staff_b_id.eq.' + user.id)
  }
  const [{ data: swaps }, { data: staff }, { data: schedules }] = await Promise.all([
    swapsQuery,
    supabase.from('profiles').select('id,full_name,role').eq('active', true).neq('id', user.id),
    supabase.from('schedules').select('id,slot_date,slot_label').eq('status','approved').gte('slot_date', new Date().toISOString().slice(0,10)),
  ])
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#323232] tracking-tight">Shift Swaps</h1>
        <p className="text-gray-500 text-sm mt-1">Request and manage shift swaps</p>
      </div>
      <SwapManager profile={profile} swapRequests={swaps||[]} staff={staff||[]} schedules={schedules||[]}/>
    </div>
  )
}
