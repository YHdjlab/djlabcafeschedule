const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const supabase = createClient(
  "https://gxmdtemgiuvahlcaobrr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWR0ZW1naXV2YWhsY2FvYnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzMjYyMCwiZXhwIjoyMDkyNTA4NjIwfQ.S3Q-YJf_dlJqSPKebfNWFpwUo-2_x-Ci5llCK6_ueps",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  // 1. Fix JP role via service role
  const { data, error } = await supabase.from("profiles").update({ role: "admin" }).eq("email", "hoyekjp@gmail.com").select();
  console.log("JP role update:", data?.[0]?.role, error?.message || "OK");

  // 2. Update schedule page - filter by staff if not admin
  fs.writeFileSync("src/app/(dashboard)/schedule/page.tsx", `import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { ScheduleView } from '@/components/schedule/schedule-view'

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  const isAdmin = ['gm', 'admin', 'supervisor_floor', 'supervisor_bar'].includes(profile.role)

  const baseQuery = supabase
    .from('schedules')
    .select('*, supervisor:supervisor_id(id,full_name,role), bar_staff:bar_staff_id(id,full_name,role), floor_staff1:floor_staff1_id(id,full_name,role), floor_staff2:floor_staff2_id(id,full_name,role)')
    .eq('status', 'approved')
    .order('slot_date', { ascending: true })

  // Staff only see shifts they are assigned to
  const schedulesQuery = isAdmin
    ? baseQuery
    : baseQuery.or(\`supervisor_id.eq.\${user.id},bar_staff_id.eq.\${user.id},floor_staff1_id.eq.\${user.id},floor_staff2_id.eq.\${user.id}\`)

  const [{ data: allSchedules }, { data: availability }] = await Promise.all([
    schedulesQuery,
    supabase.from('availability').select('staff_id, slot_key, slot_date, available').eq('available', true)
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#323232]">Schedule</h1>
        <p className="text-gray-500 text-sm mt-1">{isAdmin ? 'Full team schedule' : 'Your upcoming shifts'}</p>
      </div>
      <ScheduleView schedules={allSchedules || []} profile={profile} isAdmin={isAdmin} availability={availability || []}/>
    </div>
  )
}
`);
  console.log("schedule/page.tsx updated");

  // 3. Create change password page
  fs.mkdirSync("src/app/(dashboard)/settings", { recursive: true });
  fs.writeFileSync("src/app/(dashboard)/settings/page.tsx", `import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { PasswordChange } from '@/components/settings/password-change'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-[#323232]">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account</p>
      </div>
      <PasswordChange profile={profile}/>
    </div>
  )
}
`);
  console.log("settings/page.tsx created");

  // 4. Create PasswordChange component
  fs.mkdirSync("src/components/settings", { recursive: true });
  fs.writeFileSync("src/components/settings/password-change.tsx", `'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, AlertCircle, User } from 'lucide-react'

export function PasswordChange({ profile }: { profile: any }) {
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (newPass.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPass !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    // Re-authenticate with current password first
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: profile.email, password: current })
    if (signInError) { setError('Current password is incorrect'); setLoading(false); return }
    // Update password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPass })
    if (updateError) { setError(updateError.message); setLoading(false); return }
    setSuccess(true)
    setCurrent(''); setNewPass(''); setConfirm('')
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Your Profile</CardTitle></CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#323232] flex items-center justify-center">
            <span className="text-white text-xl font-bold">{profile.full_name?.charAt(0)}</span>
          </div>
          <div>
            <p className="font-bold text-[#323232] text-lg">{profile.full_name}</p>
            <p className="text-sm text-gray-400">{profile.email}</p>
            <p className="text-xs text-[#FF6357] font-semibold mt-0.5 capitalize">{profile.role?.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            placeholder="Your current password"
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            placeholder="At least 6 characters"
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat new password"
            required
          />
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0"/>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-2xl">
              <Check size={14} className="text-green-500 flex-shrink-0"/>
              <p className="text-sm text-green-600 font-medium">Password changed successfully!</p>
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  )
}
`);
  console.log("password-change.tsx created");

  // 5. Add Settings to sidebar nav
  let sidebar = fs.readFileSync("src/components/layout/sidebar.tsx", "utf8");
  sidebar = sidebar.replace(
    `  { href: '/admin', label: 'Admin', icon: Settings, adminOnly: true },`,
    `  { href: '/settings', label: 'Settings', icon: User },
  { href: '/admin', label: 'Admin', icon: Settings, adminOnly: true },`
  );
  sidebar = sidebar.replace(
    `import { LayoutDashboard, Calendar, Clock, ArrowLeftRight, CalendarOff, CheckSquare, Settings, LogOut, Menu, X } from 'lucide-react'`,
    `import { LayoutDashboard, Calendar, Clock, ArrowLeftRight, CalendarOff, CheckSquare, Settings, LogOut, Menu, X, User } from 'lucide-react'`
  );
  fs.writeFileSync("src/components/layout/sidebar.tsx", sidebar, "utf8");
  console.log("sidebar updated with Settings link");

  console.log("\nAll done!");
}
main();
