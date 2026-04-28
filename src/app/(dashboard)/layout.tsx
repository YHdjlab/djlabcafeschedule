import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/login")
  return (
    <div style={{minHeight:"100vh", backgroundColor:"#F7F0E8"}}>
      <Navbar profile={profile}/>
      <main style={{paddingTop:"64px"}}>
        <div style={{padding:"32px 40px 64px 40px", maxWidth:"1400px", margin:"0 auto"}}>{children}</div>
      </main>
    </div>
  )
}
