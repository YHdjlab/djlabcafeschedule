const fs = require("fs");
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
const lines = ag.split("\n");
const newLines = [
  ...lines.slice(0, 202),
  "            <div key={day} style={{backgroundColor:'#242424',borderRadius:'14px',border: isWeekend ? '1px solid rgba(255,99,87,0.2)' : '1px solid rgba(255,255,255,0.08)',overflow:'hidden'}}>",
  "              {/* Day header */}",
  "              <div style={{padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',backgroundColor: isWeekend ? 'rgba(255,99,87,0.1)' : 'rgba(255,255,255,0.04)'}}>",
  ...lines.slice(209)
];
fs.writeFileSync("src/components/schedule/availability-grid.tsx", newLines.join("\n"), "utf8");
console.log("fixed, lines:", newLines.length);
