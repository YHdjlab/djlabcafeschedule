const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

ap = ap.replace(
  "      const sortedPool=[...nonSupPool].sort((a:string,b:string)=>scoreStaff(b)-scoreStaff(a))",
  `      const sortedPool=[...nonSupPool].sort((a:string,b:string)=>scoreStaff(b)-scoreStaff(a))
      if(day==='Monday'||day==='Saturday'){
        console.log(day,'sup1:',supervisor_id?STAFF_MAP[supervisor_id]?.full_name+' '+sup1Info?.startH+'-'+sup1Info?.endH:'none')
        console.log(day,'sup2:',supervisor2_id?STAFF_MAP[supervisor2_id]?.full_name+' '+sup2Info?.startH+'-'+sup2Info?.endH:'none')
        console.log(day,'pool scores:',nonSupPool.map((id:string)=>STAFF_MAP[id]?.full_name+':'+scoreStaff(id)))
        console.log(day,'sorted:',sortedPool.map((id:string)=>STAFF_MAP[id]?.full_name))
      }`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
