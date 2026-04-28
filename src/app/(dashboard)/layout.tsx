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
    <div style={{minHeight:"100vh", backgroundColor:"#111111"}}>
      <Navbar profile={profile}/>
      <main style={{paddingTop:"64px"}}>
        <div style={{padding:"28px 32px 64px 32px"}}>{children}</div>
      </main>
    </div>
  )
}
