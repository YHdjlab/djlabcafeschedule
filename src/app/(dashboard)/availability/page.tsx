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

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('staff_id', user.id)
    .gte('week_starting', currentMonday)

  const { data: rushConfig } = await supabase
    .from('rush_hour_config')
    .select('*')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#323232]">My Availability</h1>
        <p className="text-gray-500 text-sm mt-1">Set your availability for upcoming weeks</p>
      </div>
      <AvailabilityGrid
        profile={profile}
        availability={availability || []}
        nextMonday={nextMonday}
        currentMonday={currentMonday}
        rushConfig={rushConfig || []}
      />
    </div>
  )
}
