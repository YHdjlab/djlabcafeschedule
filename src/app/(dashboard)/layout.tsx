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
    <div className="min-h-screen bg-[#F7F0E8]">
      <Sidebar profile={profile}/>
      <main className="min-h-screen hidden lg:block" style={{marginLeft:"240px", maxWidth:"calc(100% - 240px)"}}>
        <div style={{padding:"36px 40px 60px 40px", boxSizing:"border-box", width:"100%"}}>{children}</div>
      </main>
      <main className="min-h-screen lg:hidden">
        <div style={{padding:"72px 20px 48px 20px"}}>{children}</div>
      </main>
    </div>
  )
}
