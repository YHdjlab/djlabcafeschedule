const fs = require("fs");

// Fix layout - the real issue is overflow-x clip cutting content
// Use a different approach: just ensure right padding is always there
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
      <main className="min-h-screen hidden lg:block" style={{marginLeft: "240px", width: "calc(100vw - 240px)"}}>
        <div style={{padding: "36px", boxSizing: "border-box", width: "100%"}}>{children}</div>
      </main>
      <main className="min-h-screen lg:hidden">
        <div style={{padding: "72px 20px 48px", boxSizing: "border-box", width: "100%"}}>{children}</div>
      </main>
    </div>
  )
}`;
fs.writeFileSync("src/app/(dashboard)/layout.tsx", layout, "utf8");
console.log("layout fixed");

// Fix globals - ensure all elements respect box sizing
let css = fs.readFileSync("src/app/globals.css", "utf8");
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

html {
  -webkit-text-size-adjust: 100%;
}

body {
  background-color: #F7F0E8;
  color: #323232;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:root {
  --brand-dark: #323232;
  --brand-cream: #F7F0E8;
  --brand-coral: #FF6357;
}

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`, "utf8");
console.log("globals fixed");
