const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
ap = ap.replace("const scoreStaff=(id)=>{", "const scoreStaff=(id:string):number=>{");
ap = ap.replace(
  "const supOverlap=(sup1Info?avail.filter(h=>h>=sup1Info.startH&&h<sup1Info.endH).length:0)+(sup2Info?avail.filter(h=>h>=sup2Info.startH&&h<sup2Info.endH).length:0)",
  "const supOverlap=(sup1Info?avail.filter((h:number)=>h>=sup1Info.startH&&h<sup1Info.endH).length:0)+(sup2Info?avail.filter((h:number)=>h>=sup2Info.startH&&h<sup2Info.endH).length:0)"
);
ap = ap.replace(
  "const rush=avail.filter(h=>h>=rushStartH&&h<rushEndH).length",
  "const rush=avail.filter((h:number)=>h>=rushStartH&&h<rushEndH).length"
);
ap = ap.replace(
  "availStaff.filter(id=>!excludedSet.has(id)).sort((a,b)=>scoreStaff(b)-scoreStaff(a))",
  "availStaff.filter((id:string)=>!excludedSet.has(id)).sort((a:string,b:string)=>scoreStaff(b)-scoreStaff(a))"
);
ap = ap.replace(
  "sortedPool.map(id=>STAFF_MAP[id]?.full_name+':'+scoreStaff(id))",
  "sortedPool.map((id:string)=>STAFF_MAP[id]?.full_name+':'+scoreStaff(id))"
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
