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
        <h1 style={{color:'#F7F0E8',fontSize:'22px',fontWeight:800,marginBottom:'4px'}}>Settings</h1>
        <p style={{color:'rgba(247,240,232,0.45)',fontSize:'13px',marginBottom:'20px'}}>Manage your account</p>
      </div>
      <PasswordChange profile={profile}/>
    </div>
  )
}
