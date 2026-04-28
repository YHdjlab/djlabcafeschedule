import { createClient } from '@/lib/supabase-server'
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
        <h1 className="text-2xl font-bold text-[#323232] tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account</p>
      </div>
      <PasswordChange profile={profile}/>
    </div>
  )
}
