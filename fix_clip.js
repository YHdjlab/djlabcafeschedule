const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Remove overflow-hidden from Save and Submit header - it clips the button
ap = ap.replace(
  '<div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between gap-4 overflow-hidden">',
  '<div className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between gap-4">'
);

// Remove ring-2 from day cards - ring extends outside bounds
ap = ap.replace(
  "slot.issues?.length ? 'ring-2 ring-red-200' : 'ring-1 ring-black/5'",
  "slot.issues?.length ? 'border-2 border-red-200' : 'border border-black/5'"
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
