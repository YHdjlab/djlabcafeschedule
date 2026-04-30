const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");

// Replace lines 364-374 (0-indexed: 363-373) with new scoring algorithm
const newLines = [
  "      // Score-based staff assignment - rush coverage is king",
  "      const scoreStaff=(id)=>{",
  "        const avail=getAvail(id)",
  "        const supOverlap=(sup1Info?avail.filter(h=>h>=sup1Info.startH&&h<sup1Info.endH).length:0)+(sup2Info?avail.filter(h=>h>=sup2Info.startH&&h<sup2Info.endH).length:0)",
  "        const rush=avail.filter(h=>h>=rushStartH&&h<rushEndH).length",
  "        const total=avail.length",
  "        const fair=-(assignCount[id]||0)",
  "        return rush*1000+total*100+supOverlap*10+fair",
  "      }",
  "      const excludedSet=new Set([supervisor_id,supervisor2_id].filter(Boolean))",
  "      const sortedPool=availStaff.filter(id=>!excludedSet.has(id)).sort((a,b)=>scoreStaff(b)-scoreStaff(a))",
  "      console.log(day,'scores:',sortedPool.map(id=>STAFF_MAP[id]?.full_name+':'+scoreStaff(id)))",
  "",
  "      const bar_staff_id=sortedPool[0]||null",
  "      if(bar_staff_id)assignCount[bar_staff_id]=(assignCount[bar_staff_id]||0)+8",
  "",
  "      const floor_staff1_id=sortedPool[1]||null",
  "      if(floor_staff1_id)assignCount[floor_staff1_id]=(assignCount[floor_staff1_id]||0)+8",
  "",
  "      const floor_staff2_id=isWeekend?(sortedPool[2]||null):null",
  "      if(floor_staff2_id)assignCount[floor_staff2_id]=(assignCount[floor_staff2_id]||0)+8",
];

// Replace lines 364-374 (indices 363-373)
lines.splice(363, 11, ...newLines);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", lines.join("\n"), "utf8");
console.log("Replaced lines 364-374 with new scoring algorithm");
console.log("Verify line 364:", lines[363]);
console.log("Verify line 374:", lines[373]);
