const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// The issue: scoreStaff uses sup1Info and sup2Info which are computed AFTER
// the sort runs in some cases, OR sup1Info.endH after gap-extension is 17 not 16
// Let's trace: sup1Info for Monday = {startH:8, endH:17} after gap extension
// getAvail(Lucciana) on Monday = [15,16,17,18,19,20,21,22,23]
// filter h>=8&&h<17 = [15,16] = 2
// filter h>=17&&h<24 = [17,18,19,20,21,22,23] = 7
// Total supOverlap = 9 * 100 = 900 ✓

// But getAvail(Rouba) = [8,9,10] only 3 hours, supOverlap=3*100=300
// So Lucciana SHOULD beat Rouba...

// Wait - is weekAvailability filtering correctly?
// Let's check: the scoreStaff function captures sup1Info/sup2Info from outer scope
// But sup1Info might be null if supervisor assignment didn't find a split...

// Actually I think the bug is simpler: nonSupPool = availStaff.filter(!excluded)
// But availStaff is built from weekAvailability which only has available:true entries
// Let's verify by logging the actual nonSupPool

ap = ap.replace(
  `      if(day==='Monday'||day==='Saturday'){`,
  `      {`
);
ap = ap.replace(
  `        console.log(day,'sup1:',supervisor_id?STAFF_MAP[supervisor_id]?.full_name+' '+sup1Info?.startH+'-'+sup1Info?.endH:'none')
        console.log(day,'sup2:',supervisor2_id?STAFF_MAP[supervisor2_id]?.full_name+' '+sup2Info?.startH+'-'+sup2Info?.endH:'none')
        console.log(day,'pool scores:',nonSupPool.map((id:string)=>STAFF_MAP[id]?.full_name+':'+scoreStaff(id)))
        console.log(day,'sorted:',sortedPool.map((id:string)=>STAFF_MAP[id]?.full_name))
      }`,
  `        console.log(day,'sup1:',supervisor_id?STAFF_MAP[supervisor_id]?.full_name+' '+sup1Info?.startH+'-'+sup1Info?.endH:'none','sup2:',supervisor2_id?STAFF_MAP[supervisor2_id]?.full_name+' '+sup2Info?.startH+'-'+sup2Info?.endH:'none')
        console.log(day,'scores:',nonSupPool.map((id:string)=>({n:STAFF_MAP[id]?.full_name,s:scoreStaff(id),avail:getAvail(id).length,supOvlp:((sup1Info?getAvail(id).filter((h:number)=>h>=sup1Info.startH&&h<sup1Info.endH).length:0)+(sup2Info?getAvail(id).filter((h:number)=>h>=sup2Info.startH&&h<sup2Info.endH).length:0))})))
        console.log(day,'assigned:',bar_staff_id?STAFF_MAP[bar_staff_id]?.full_name:'none',floor_staff1_id?STAFF_MAP[floor_staff1_id]?.full_name:'none')
      }`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
