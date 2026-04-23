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
      <main style={{paddingLeft: "240px"}} className="min-h-screen hidden lg:block">
        <div style={{padding: "32px"}}>{children}</div>
      </main>
      <main className="min-h-screen lg:hidden">
        <div style={{padding: "72px 16px 32px"}}>{children}</div>
      </main>
    </div>
  )
}