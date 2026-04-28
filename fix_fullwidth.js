const fs = require("fs");

// 1. Remove max-width constraint on admin page
let ap = fs.readFileSync("src/app/(dashboard)/admin/page.tsx", "utf8");
ap = ap.replace(/max-w-\w+\s?/g, "");
fs.writeFileSync("src/app/(dashboard)/admin/page.tsx", ap, "utf8");

// 2. Remove the rounded dark wrapper from admin panel - just use full width
let panel = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
panel = panel.replace(
  '<div style={{ backgroundColor: BG, borderRadius: \'20px\', padding: \'24px\', minHeight: \'600px\' }}>',
  '<div style={{ backgroundColor: BG, borderRadius: \'0\', padding: \'0\', minHeight: \'600px\' }}>'
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", panel, "utf8");

// 3. Make layout full width with less padding for admin
let layout = fs.readFileSync("src/app/(dashboard)/layout.tsx", "utf8");
layout = layout.replace(
  '<div style={{padding:"32px 40px 64px 40px", maxWidth:"1400px", margin:"0 auto"}}>',
  '<div style={{padding:"24px 32px 64px 32px"}}>'
);
fs.writeFileSync("src/app/(dashboard)/layout.tsx", layout, "utf8");

console.log("done");
