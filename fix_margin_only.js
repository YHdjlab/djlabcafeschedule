const fs = require("fs");
fs.writeFileSync("src/app/(dashboard)/layout.tsx", `import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/login")
  return (
    <div style={{minHeight:"100vh", backgroundColor:"#F7F0E8"}}>
      <Sidebar profile={profile}/>
      <main className="hidden lg:block" style={{marginLeft:"240px", minHeight:"100vh"}}>
        <div style={{padding:"32px 32px 64px 32px"}}>{children}</div>
      </main>
      <main className="lg:hidden" style={{minHeight:"100vh"}}>
        <div style={{padding:"72px 20px 48px 20px"}}>{children}</div>
      </main>
    </div>
  )
}
`);
console.log("done");
