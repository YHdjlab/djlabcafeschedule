const fs = require("fs");
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");

// Fix outer wrapper
ag = ag.replace(
  '<div className="space-y-4">',
  '<div style={{display:"flex",flexDirection:"column",gap:"16px"}}>'
);

// Fix week nav wrapper
ag = ag.replace(
  '<div className="bg-white rounded-3xl border border-black/[0.06] shadow-sm p-4 flex items-center justify-between">',
  '<div style={{backgroundColor:"#242424",borderRadius:"16px",border:"1px solid rgba(255,255,255,0.08)",padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>'
);

// Fix corrupted em dash
ag = ag.replace(/â€"/g, "–");

// Fix shift counters grid
ag = ag.replace(
  '<div className="grid grid-cols-3 gap-3">',
  '<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px"}}>'
);

// Fix day cards outer wrapper
ag = ag.replace(
  '<div className="space-y-3">',
  '<div style={{display:"flex",flexDirection:"column",gap:"10px"}}>'
);

fs.writeFileSync("src/components/schedule/availability-grid.tsx", ag, "utf8");
console.log("done");
