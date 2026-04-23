const fs = require("fs");

// Write layout with inline style - guaranteed to work
const layout = `import { createClient } from "@/lib/supabase-server"
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
        <div className="px-4 pt-8 pb-8 lg:px-8">{children}</div>
      </main>
      <main className="min-h-screen lg:hidden">
        <div className="px-4 pt-16 pb-8">{children}</div>
      </main>
    </div>
  )
}`;

fs.writeFileSync("src/app/(dashboard)/layout.tsx", layout, "utf8");
console.log("Done");
