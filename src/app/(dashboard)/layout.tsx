import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  return (
    <div className="min-h-screen bg-[#F7F0E8]">
      <Sidebar profile={profile}/>
      <main className="lg:ml-60 min-h-screen">
        <div className="px-4 pt-16 pb-8 lg:pt-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}