const fs = require("fs");
let layout = fs.readFileSync("src/app/(dashboard)/layout.tsx", "utf8");
layout = `import { createClient } from "@/lib/supabase-server"
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
      <main style={{paddingLeft: "240px", paddingRight: "0px"}} className="min-h-screen hidden lg:block">
        <div style={{padding: "32px"}}>{children}</div>
      </main>
      <main className="min-h-screen lg:hidden">
        <div style={{padding: "72px 16px 32px"}}>{children}</div>
      </main>
    </div>
  )
}`;
fs.writeFileSync("src/app/(dashboard)/layout.tsx", layout, "utf8");

// Also fix globals - remove overflow-x hidden from html/body which clips content
let css = fs.readFileSync("src/app/globals.css", "utf8");
css = css.replace(
  "html, body {\n  max-width: 100vw;\n  overflow-x: hidden;",
  "html, body {\n  max-width: 100%;"
);
fs.writeFileSync("src/app/globals.css", css, "utf8");
console.log("done");
