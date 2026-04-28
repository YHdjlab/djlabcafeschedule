const fs = require("fs");

// THE REAL FIX:
// The sidebar is 240px fixed. Main content needs to be exactly viewport - 240px.
// We achieve this by setting the outer wrapper to position relative,
// and using a proper CSS approach.

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
    <div style={{display:'flex', minHeight:'100vh', backgroundColor:'#F7F0E8'}}>
      <div style={{width:'240px', flexShrink:0}}>
        <Sidebar profile={profile}/>
      </div>
      <div style={{flex:1, minWidth:0, overflowX:'hidden'}} className="hidden lg:block">
        <div style={{padding:'36px 40px 60px 40px'}}>{children}</div>
      </div>
      <div style={{flex:1, minWidth:0}} className="lg:hidden">
        <div style={{padding:'72px 20px 48px 20px'}}>{children}</div>
      </div>
    </div>
  )
}
`);
console.log("layout.tsx fixed - using flexbox approach");

// Fix sidebar - must be sticky not fixed so it works in flex container
let sidebar = fs.readFileSync("src/components/layout/sidebar.tsx", "utf8");
sidebar = sidebar.replace(
  '<aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-full w-60 z-30" style={{width:"240px"}}>',
  '<aside className="hidden lg:flex lg:flex-col sticky top-0 h-screen w-60 z-30">'
);
sidebar = sidebar.replace(
  '<aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-full w-60 z-30">',
  '<aside className="hidden lg:flex lg:flex-col sticky top-0 h-screen w-60 z-30">'
);
fs.writeFileSync("src/components/layout/sidebar.tsx", sidebar, "utf8");
console.log("sidebar.tsx fixed - sticky instead of fixed");

// Fix schedule builder - remove padding that causes overflow
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
// Remove extra padding on day cards
ap = ap.replace(
  '<div className="px-6 py-4 space-y-3">',
  '<div className="px-4 py-4 space-y-3">'
);
ap = ap.replace(
  '<div key={member.id} className={cn("rounded-2xl border px-5 py-4", roleBg, member.role === \'Available\' && \'opacity-70\')}>',
  '<div key={member.id} className={cn("rounded-2xl border px-4 py-3", roleBg, member.role === \'Available\' && \'opacity-70\')}>'
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("admin-panel.tsx updated");

console.log("\nDone! Flexbox layout prevents overflow by design.");
