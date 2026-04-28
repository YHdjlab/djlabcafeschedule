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
    <div className="min-h-screen bg-[#F7F0E8]">
      <Sidebar profile={profile}/>
      <main className="min-h-screen hidden lg:block" style={{marginLeft:"240px", maxWidth:"calc(100vw - 240px)", overflowX:"hidden"}}>
        <div style={{padding:"36px 40px 60px 40px", boxSizing:"border-box", width:"100%"}}>{children}</div>
      </main>
      <main className="min-h-screen lg:hidden">
        <div style={{padding:"72px 20px 48px 20px"}}>{children}</div>
      </main>
    </div>
  )
}
`);

// Fix globals - prevent body from overflowing
fs.writeFileSync("src/app/globals.css", `@import 'tailwindcss';

@theme {
  --color-brand-dark: #323232;
  --color-brand-cream: #F7F0E8;
  --color-brand-coral: #FF6357;
}

*, *::before, *::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html, body {
  overflow-x: hidden;
  background-color: #F7F0E8;
  color: #323232;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

:root {
  --brand-dark: #323232;
  --brand-cream: #F7F0E8;
  --brand-coral: #FF6357;
}

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`);

console.log("done");
