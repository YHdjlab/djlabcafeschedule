const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix 1: extend sup1 to cover gap between sup1 end and sup2 start
ap = ap.replace(
  `        if(supervisor_id)assignCount[supervisor_id]=(assignCount[supervisor_id]||0)+(sup1Info?.totalH||8)
        if(supervisor2_id)assignCount[supervisor2_id]=(assignCount[supervisor2_id]||0)+(sup2Info?.totalH||8)`,
  `        // Close any gap between sup1 end and sup2 start by extending sup1
        if(sup1Info&&sup2Info&&sup2Info.startH>sup1Info.endH){
          sup1Info={...sup1Info,endH:sup2Info.startH,totalH:sup2Info.startH-sup1Info.startH}
        }
        // Close any gap between sup2 end and midnight by checking if day ends after sup2
        if(supervisor_id)assignCount[supervisor_id]=(assignCount[supervisor_id]||0)+(sup1Info?.totalH||8)
        if(supervisor2_id)assignCount[supervisor2_id]=(assignCount[supervisor2_id]||0)+(sup2Info?.totalH||8)`
);

// Fix 2: rush coverage must strongly outweigh hour count in bar/floor sorting
ap = ap.replace(
  `      // Assign bar/floor - prefer staff who cover rush hours
      const coversRush=(id:string)=>{
        const avail=getAvail(id)
        return avail.some((h:number)=>h>=rushStartH&&h<rushEndH)
      }
      const byRushThenLeast=(ids:string[])=>[...ids].sort((a:string,b:string)=>{
        const ar=coversRush(a)?0:1, br=coversRush(b)?0:1
        if(ar!==br)return ar-br
        return(assignCount[a]||0)-(assignCount[b]||0)
      })`,
  `      // Assign bar/floor - rush coverage is the PRIMARY criterion
      const rushHoursCovered=(id:string)=>{
        const avail=getAvail(id)
        return avail.filter((h:number)=>h>=rushStartH&&h<rushEndH).length
      }
      const totalHoursCovered=(id:string)=>getAvail(id).length
      const byRushThenLeast=(ids:string[])=>[...ids].sort((a:string,b:string)=>{
        // Primary: most rush hours covered
        const rushDiff=rushHoursCovered(b)-rushHoursCovered(a)
        if(rushDiff!==0)return rushDiff
        // Secondary: most total hours available (more flexible = better)
        const totalDiff=totalHoursCovered(b)-totalHoursCovered(a)
        if(totalDiff!==0)return totalDiff
        // Tertiary: least hours assigned this week (fairness)
        return(assignCount[a]||0)-(assignCount[b]||0)
      })`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
