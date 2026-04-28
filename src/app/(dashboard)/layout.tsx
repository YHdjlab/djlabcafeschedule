import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/login")
  return (
    <div style={{display:'flex', minHeight:'100vh', backgroundColor:'#F7F0E8'}}>
      <div style={{width:'240px', flexShrink:0}}>
        <Sidebar profile={profile}/>
      </div>
      <div style={{flex:1, minWidth:0, overflowX:'hidden'}} className="hidden lg:block">
        <div style={{padding:'36px 40px 60px 40px'}}>{children}</div>
      </div>
      <div style={{flex:1, minWidth:0}} className="lg:hidden">
        <div style={{padding:'72px 20px 48px 20px'}}>{children}</div>
      </div>
    </div>
  )
}
