const fs = require("fs");

// Fix layout - add overflow-x clip to prevent any content from bleeding right
let layout = fs.readFileSync("src/app/(dashboard)/layout.tsx", "utf8");
layout = layout.replace(
  '<main className="min-h-screen hidden lg:block" style={{marginLeft: "240px"}}>',
  '<main className="min-h-screen hidden lg:block" style={{marginLeft: "240px", overflowX: "clip"}}>'
);
layout = layout.replace(
  '<div style={{padding: "36px 36px 60px 36px"}}>{children}</div>',
  '<div style={{padding: "36px 36px 60px 36px", maxWidth: "100%", boxSizing: "border-box"}}>{children}</div>'
);
fs.writeFileSync("src/app/(dashboard)/layout.tsx", layout, "utf8");
console.log("layout fixed");

// Fix globals - ensure nothing overflows
let css = fs.readFileSync("src/app/globals.css", "utf8");
css = css.replace(
  "*, *::before, *::after {\n  box-sizing: border-box;\n  padding: 0;\n  margin: 0;\n}",
  "*, *::before, *::after {\n  box-sizing: border-box;\n  padding: 0;\n  margin: 0;\n  min-width: 0;\n}"
);
fs.writeFileSync("src/app/globals.css", css, "utf8");
console.log("globals fixed");

// Fix admin panel - the day header and save button need proper overflow handling
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix the schedule preview header save button
ap = ap.replace(
  '<div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between gap-4">',
  '<div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between gap-4 overflow-hidden">'
);

// Fix day cards - ensure overflow hidden
ap = ap.replace(
  "<div key={slot.key} className={cn('bg-white rounded-2xl overflow-hidden shadow-sm', slot.issues?.length ? 'ring-2 ring-red-200' : 'ring-1 ring-black/5')}>",
  "<div key={slot.key} className={cn('bg-white rounded-2xl overflow-hidden shadow-sm w-full', slot.issues?.length ? 'ring-2 ring-red-200' : 'ring-1 ring-black/5')}>"
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("admin panel fixed");
