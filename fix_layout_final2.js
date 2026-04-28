const fs = require("fs");

// Revert to working layout but fix the scrollbar overflow issue
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
    <div className="min-h-screen bg-[#F7F0E8]">
      <Sidebar profile={profile}/>
      <main className="min-h-screen hidden lg:block" style={{marginLeft:"240px",maxWidth:"calc(100% - 240px)"}}>
        <div style={{padding:"36px 40px 60px 40px"}}>{children}</div>
      </main>
      <main className="min-h-screen lg:hidden">
        <div style={{padding:"72px 20px 48px 20px"}}>{children}</div>
      </main>
    </div>
  )
}
`);
console.log("layout fixed");

// Revert sidebar to fixed
let sidebar = fs.readFileSync("src/components/layout/sidebar.tsx", "utf8");
sidebar = sidebar.replace(
  '<aside className="hidden lg:flex lg:flex-col sticky top-0 h-screen w-60 z-30">',
  '<aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-full w-60 z-30">'
);
fs.writeFileSync("src/components/layout/sidebar.tsx", sidebar, "utf8");
console.log("sidebar reverted to fixed");
