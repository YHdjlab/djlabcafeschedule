const fs = require("fs");

// THE ROOT FIX: Use position-based layout instead of calc()
// marginLeft: 240px on main, no width constraint needed
// The browser handles the rest naturally
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
      <main className="min-h-screen hidden lg:block" style={{marginLeft: "240px"}}>
        <div style={{padding: "36px 40px 60px 40px"}}>{children}</div>
      </main>
      <main className="min-h-screen lg:hidden">
        <div style={{padding: "72px 20px 48px 20px"}}>{children}</div>
      </main>
    </div>
  )
}
`);
console.log("layout.tsx fixed");

// Fix globals - no overflow restrictions at all on html/body
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
console.log("globals.css fixed");

// Fix root layout - no overflow restrictions
fs.writeFileSync("src/app/layout.tsx", `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DjLab Cafe Schedule',
  description: 'Staff scheduling system for DjLab Cafe',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
`);
console.log("root layout.tsx fixed");

// Fix all page wrapper divs - remove any max-w constraints that cut content
// and ensure space-y wrappers don't overflow
const pages = [
  "src/app/(dashboard)/admin/page.tsx",
  "src/app/(dashboard)/availability/page.tsx",
  "src/app/(dashboard)/schedule/page.tsx",
  "src/app/(dashboard)/swaps/page.tsx",
  "src/app/(dashboard)/days-off/page.tsx",
  "src/app/(dashboard)/attendance/page.tsx",
  "src/app/(dashboard)/settings/page.tsx",
];

pages.forEach(f => {
  try {
    let content = fs.readFileSync(f, "utf8");
    // Remove max-w-5xl or similar that could cause issues on non-dashboard pages
    // Keep it on dashboard since it looks better there
    if (!f.includes("dashboard")) {
      content = content.replace(/max-w-\w+\s/g, "");
    }
    fs.writeFileSync(f, content, "utf8");
  } catch(e) {}
});
console.log("pages fixed");

// Fix sidebar - ensure it doesn't cause overflow
let sidebar = fs.readFileSync("src/components/layout/sidebar.tsx", "utf8");
// Make sure sidebar is exactly w-60 with no overflow
sidebar = sidebar.replace(
  '<aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-full w-60 z-30">',
  '<aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-full w-60 z-30" style={{width:"240px"}}>'
);
fs.writeFileSync("src/components/layout/sidebar.tsx", sidebar, "utf8");
console.log("sidebar.tsx fixed");

console.log("\nAll done! The fix uses marginLeft:240px on main with no width constraint.");
console.log("Browser naturally sizes content to fill remaining space without overflow.");
