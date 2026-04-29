const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Replace getStaffHours with smart shift assignment
ap = ap.replace(
  `  const getStaffHours=(staffId:string,dateStr:string)=>{
    const hours=weekAvailability.filter((a:any)=>a.staff_id===staffId&&a.slot_date===dateStr)
      .map((a:any)=>{const m=a.slot_key.match(/_h(\\d+)$/);return m?parseInt(m[1]):-1})
      .filter((h:number)=>h>=0).sort((a:number,b:number)=>a-b)
    if(!hours.length)return null
    return{startH:hours[0],endH:hours[hours.length-1]+1,totalH:hours[hours.length-1]+1-hours[0],hours}
  }`,
  `  // Get available hours for a staff member on a date
  const getAvailableHours=(staffId:string,dateStr:string):number[]=>{
    return weekAvailability.filter((a:any)=>a.staff_id===staffId&&a.slot_date===dateStr)
      .map((a:any)=>{const m=a.slot_key.match(/_h(\\d+)$/);return m?parseInt(m[1]):-1})
      .filter((h:number)=>h>=0).sort((a:number,b:number)=>a-b)
  }

  // Assign best 8h shift window from available hours
  // Prefers: rush coverage, then earliest start
  const getStaffHours=(staffId:string,dateStr:string,rushStartH:number,rushEndH:number)=>{
    const avail=getAvailableHours(staffId,dateStr)
    if(!avail.length)return null

    // Try AM (8-16), MID (12-20), PM (16-24) - pick best fit
    const SHIFTS=[{s:8,e:16},{s:12,e:20},{s:16,e:24}]
    let bestShift=null
    let bestScore=-1

    for(const shift of SHIFTS){
      const covered=avail.filter(h=>h>=shift.s&&h<shift.e)
      if(covered.length<4)continue // need at least 4h overlap
      // Score: rush coverage + overlap length
      const rushCovered=covered.filter(h=>h>=rushStartH&&h<rushEndH).length
      const score=covered.length+rushCovered*2
      if(score>bestScore){bestScore=score;bestShift=shift}
    }

    if(!bestShift){
      // Fallback: find longest consecutive block up to 8h
      let best={startH:avail[0],endH:avail[0]+1,totalH:1}
      let runStart=avail[0],runEnd=avail[0]
      for(let i=1;i<avail.length;i++){
        if(avail[i]===runEnd+1&&avail[i]-runStart<8){runEnd=avail[i]}
        else{
          if(runEnd-runStart+1>best.totalH){best={startH:runStart,endH:runEnd+1,totalH:runEnd-runStart+1}}
          runStart=avail[i];runEnd=avail[i]
        }
      }
      if(runEnd-runStart+1>best.totalH){best={startH:runStart,endH:runEnd+1,totalH:runEnd-runStart+1}}
      return best
    }

    // Trim to actual available hours within shift
    const trimmed=avail.filter(h=>h>=bestShift.s&&h<bestShift.e)
    return{startH:trimmed[0],endH:trimmed[trimmed.length-1]+1,totalH:trimmed[trimmed.length-1]+1-trimmed[0],hours:trimmed}
  }`
);

// Update all getStaffHours calls to pass rushStartH and rushEndH
ap = ap.replace(
  /getStaffHours\(([^,)]+),\s*dateStr\)/g,
  'getStaffHours($1, dateStr, rushStartH, rushEndH)'
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
