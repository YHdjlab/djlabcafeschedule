const fs = require("fs");

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
    <div className="min-h-screen bg-[#F7F0E8] flex">
      <Sidebar profile={profile}/>
      <main className="flex-1 min-h-screen min-w-0 lg:pl-60">
        <div className="px-4 pt-16 pb-8 lg:pt-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}`;

fs.writeFileSync("src/app/(dashboard)/layout.tsx", layout, "utf8");
console.log("layout written");
