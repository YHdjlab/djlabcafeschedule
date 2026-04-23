const fs = require("fs");
const page = `import { createClient } from '@/lib/supabase-server'
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
    supabase.from('schedules').select('*').gte('slot_date', currentMonday).or('supervisor_id.eq.' + user.id + ',bar_staff_id.eq.' + user.id + ',floor_staff1_id.eq.' + user.id + ',floor_staff2_id.eq.' + user.id),
  ])
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#323232]">My Availability</h1>
        <p className="text-gray-500 text-sm mt-1">Select hours you are available. Submit when done.</p>
      </div>
      <AvailabilityGrid
        profile={profile}
        availability={availability || []}
        schedules={schedules || []}
        nextMonday={nextMonday}
        currentMonday={currentMonday}
        rushConfig={rushConfig || []}
      />
    </div>
  )
}`;
fs.writeFileSync("src/app/(dashboard)/availability/page.tsx", page, "utf8");
console.log("page written");
