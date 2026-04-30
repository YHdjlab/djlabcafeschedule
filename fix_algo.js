const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Find and replace the entire generateSchedule inner loop logic
const oldLogic = `      const getAvail=(id:string)=>weekAvailability.filter((a:any)=>a.staff_id===id&&a.slot_date===dateStr).map((a:any)=>{const m=a.slot_key.match(/_h(\\d+)$/);return m?parseInt(m[1]):-1}).filter((h:number)=>h>=0).sort((a:number,b:number)=>a-b)

      // Assign supervisors with forced AM/PM split when both available
      let supervisor_id:string|null=null
      let supervisor2_id:string|null=null

      if(availSups.length===0){
        // no supervisors
      } else if(availSups.length===1){
        supervisor_id=availSups[0]
        assignCount[supervisor_id]=(assignCount[supervisor_id]||0)+8
      } else {
        // Try to split: one AM (8-16), one PM (16-24)
        const sup0=availSups[0], sup1=availSups[1]
        const avail0=getAvail(sup0), avail1=getAvail(sup1)
        const sup0HasAM=avail0.filter((h:number)=>h>=8&&h<16).length>=4
        const sup0HasPM=avail0.filter((h:number)=>h>=16&&h<24).length>=4
        const sup1HasAM=avail1.filter((h:number)=>h>=8&&h<16).length>=4
        const sup1HasPM=avail1.filter((h:number)=>h>=16&&h<24).length>=4

        if(sup0HasAM&&sup1HasPM){
          // sup0 AM, sup1 PM
          supervisor_id=sup0; supervisor2_id=sup1
        } else if(sup1HasAM&&sup0HasPM){
          // sup1 AM, sup0 PM
          supervisor_id=sup1; supervisor2_id=sup0
        } else if(sup0HasAM&&sup0HasPM&&sup1HasAM&&sup1HasPM){
          // Both fully flexible - force split: byLeast[0] gets AM, byLeast[1] gets PM
          supervisor_id=sup0; supervisor2_id=sup1
        } else {
          // Can't split cleanly - just assign whoever covers rush
          supervisor_id=availSups[0]
        }
        if(supervisor_id)assignCount[supervisor_id]=(assignCount[supervisor_id]||0)+8
        if(supervisor2_id)assignCount[supervisor2_id]=(assignCount[supervisor2_id]||0)+8
      }

      // Override getStaffHours for split supervisors to force AM/PM
      const getShiftForSup=(id:string,forceAM:boolean,forcePM:boolean)=>{
        const avail=getAvail(id)
        if(!avail.length)return null
        if(forceAM){const hrs=avail.filter((h:number)=>h>=8&&h<16);if(hrs.length)return{startH:hrs[0],endH:hrs[hrs.length-1]+1,totalH:hrs[hrs.length-1]+1-hrs[0],hours:hrs}}
        if(forcePM){const hrs=avail.filter((h:number)=>h>=16&&h<24);if(hrs.length)return{startH:hrs[0],endH:hrs[hrs.length-1]+1,totalH:hrs[hrs.length-1]+1-hrs[0],hours:hrs}}
        return getStaffHours(id,dateStr,rushStartH,rushEndH)
      }
      // sup1 gets AM if both supervisors are present, sup2 gets PM
      const hasTwoSups=!!(supervisor_id&&supervisor2_id)
      const sup1Info=supervisor_id?getShiftForSup(supervisor_id,hasTwoSups,false):null
      const sup2Info=supervisor2_id?getShiftForSup(supervisor2_id,false,hasTwoSups):null`;

const newLogic = `      // Helper: get available hours for staff on this date
      const getAvail=(id:string):number[]=>weekAvailability
        .filter((a:any)=>a.staff_id===id&&a.slot_date===dateStr)
        .map((a:any)=>{const m=a.slot_key.match(/_h(\\d+)$/);return m?parseInt(m[1]):-1})
        .filter((h:number)=>h>=0)
        .sort((a:number,b:number)=>a-b)

      // Helper: build shift info from an array of hours
      const hoursToInfo=(hrs:number[])=>hrs.length?{startH:hrs[0],endH:hrs[hrs.length-1]+1,totalH:hrs[hrs.length-1]+1-hrs[0],hours:hrs}:null

      // Helper: get hours in AM window (8-16)
      const amHours=(id:string)=>getAvail(id).filter((h:number)=>h>=8&&h<16)
      // Helper: get hours in PM window (16-24)
      const pmHours=(id:string)=>getAvail(id).filter((h:number)=>h>=16&&h<24)
      // Helper: can cover AM (at least 4h in 8-16)
      const canAM=(id:string)=>amHours(id).length>=4
      // Helper: can cover PM (at least 4h in 16-24)
      const canPM=(id:string)=>pmHours(id).length>=4

      // SUPERVISOR ASSIGNMENT: always try AM+PM split
      let supervisor_id:string|null=null
      let supervisor2_id:string|null=null
      let sup1Info:any=null
      let sup2Info:any=null

      if(availSups.length===0){
        // no supervisors available

      } else if(availSups.length===1){
        // Only one supervisor - assign them to whatever hours they have
        supervisor_id=availSups[0]
        const allAvail=getAvail(supervisor_id)
        sup1Info=hoursToInfo(allAvail)
        assignCount[supervisor_id]=(assignCount[supervisor_id]||0)+(sup1Info?.totalH||8)

      } else {
        // Two+ supervisors - try to split AM/PM
        // Find best AM supervisor and best PM supervisor
        let amSup:string|null=null, pmSup:string|null=null

        // First pass: find sups that can ONLY do AM or ONLY do PM
        for(const id of availSups){
          if(canAM(id)&&!canPM(id)&&!amSup) amSup=id
          if(canPM(id)&&!canAM(id)&&!pmSup) pmSup=id
        }

        // Second pass: assign flexible sups to fill gaps
        for(const id of availSups){
          if(id===amSup||id===pmSup) continue
          if(!amSup&&canAM(id)) amSup=id
          else if(!pmSup&&canPM(id)) pmSup=id
        }

        // If both still unassigned (all flexible), force first=AM second=PM
        if(!amSup&&!pmSup&&availSups.length>=2){
          amSup=availSups[0]; pmSup=availSups[1]
        } else if(!amSup&&pmSup){
          // only PM covered, try to get AM from remaining
          amSup=availSups.find((id:string)=>id!==pmSup&&canAM(id))||null
        } else if(amSup&&!pmSup){
          pmSup=availSups.find((id:string)=>id!==amSup&&canPM(id))||null
        }

        supervisor_id=amSup||pmSup||availSups[0]
        supervisor2_id=(pmSup&&pmSup!==supervisor_id)?pmSup:(amSup&&amSup!==supervisor_id)?amSup:null

        // Build shift infos - force AM for sup1, PM for sup2
        if(supervisor_id===amSup){
          const hrs=amHours(supervisor_id)
          sup1Info=hoursToInfo(hrs.length?hrs:getAvail(supervisor_id))
        } else {
          const hrs=pmHours(supervisor_id)
          sup1Info=hoursToInfo(hrs.length?hrs:getAvail(supervisor_id))
        }

        if(supervisor2_id){
          if(supervisor2_id===pmSup){
            const hrs=pmHours(supervisor2_id)
            sup2Info=hoursToInfo(hrs.length?hrs:getAvail(supervisor2_id))
          } else {
            const hrs=amHours(supervisor2_id)
            sup2Info=hoursToInfo(hrs.length?hrs:getAvail(supervisor2_id))
          }
        }

        if(supervisor_id)assignCount[supervisor_id]=(assignCount[supervisor_id]||0)+(sup1Info?.totalH||8)
        if(supervisor2_id)assignCount[supervisor2_id]=(assignCount[supervisor2_id]||0)+(sup2Info?.totalH||8)
      }`;

ap = ap.replace(oldLogic, newLogic);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");

// Verify replacement worked
const result = ap.includes("SUPERVISOR ASSIGNMENT: always try AM+PM split");
console.log("Replacement succeeded:", result);
