const fs = require("fs");

// Fix 1: globals.css - remove the clipping rules
let css = fs.readFileSync("src/app/globals.css", "utf8");
css = css.replace(
  "html, body {\n  max-width: 100%;\n  overflow-x: hidden;",
  "html, body {"
);
css = css.replace(
  "html, body {\n  max-width: 100vw;\n  overflow-x: hidden;",
  "html, body {"
);
css = css.replace(
  "html, body {\n  max-width: 100%;",
  "html, body {"
);
fs.writeFileSync("src/app/globals.css", css, "utf8");
console.log("globals fixed");

// Fix 2: layout - use calc() to ensure content never overflows
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
      <main className="min-h-screen hidden lg:block" style={{marginLeft: "240px"}}>
        <div style={{padding: "32px", minHeight: "100vh"}}>{children}</div>
      </main>
      <main className="min-h-screen lg:hidden">
        <div style={{padding: "72px 16px 32px"}}>{children}</div>
      </main>
    </div>
  )
}`;
fs.writeFileSync("src/app/(dashboard)/layout.tsx", layout, "utf8");
console.log("layout fixed - using marginLeft instead of paddingLeft");
