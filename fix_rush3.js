const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// In shift scoring, rush coverage should heavily outweigh open/close bonuses
// Currently: covered.length + rushCovered*3 + closeBonus(3) + openBonus(2)
// New: rushCovered should dominate so PM shift wins for fully flexible staff
ap = ap.replace(
  `      const rushCovered=covered.filter((h:number)=>h>=rushStartH&&h<rushEndH).length
      // Bonus for shifts that end at close (24) - keeps people till closing
      const closeBonus=shift.e===24?3:0
      // Bonus for shifts starting at open (8)
      const openBonus=shift.s===8?2:0
      const score=covered.length+rushCovered*3+closeBonus+openBonus`,
  `      const rushCovered=covered.filter((h:number)=>h>=rushStartH&&h<rushEndH).length
      // Rush coverage is HEAVILY weighted - shifts that span rush win
      // Close bonus < rush coverage so PM shift wins for fully flexible staff
      const closeBonus=shift.e===24?2:0
      const openBonus=shift.s===8?1:0
      const score=rushCovered*10+covered.length+closeBonus+openBonus`
);

// Also: when picking shift for non-supervisor staff, if previous slot already covers AM,
// prefer giving this person PM to maximize coverage
// We need to track which shifts are already assigned and steer remaining staff to gaps
// 
// Better approach: in the staff scoring, give bonus for staff whose BEST shift would
// overlap with existing assigned staff during rush hours

// Actually let's also fix: bar_staff and floor_staff1 might overlap AM hours
// We should encourage spread - if bar covers AM, floor should cover PM
// Track the "best shift" for each assigned staff and prefer next staff to cover gaps

// Simpler: add scoring bonus for staff whose available hours include closing time
// since closing is typically rush continuation
ap = ap.replace(
  `        const supOverlap=(sup1Info?avail.filter((h:number)=>h>=sup1Info.startH&&h<sup1Info.endH).length:0)+(sup2Info?avail.filter((h:number)=>h>=sup2Info.startH&&h<sup2Info.endH).length:0)
        const rush=avail.filter((h:number)=>h>=rushStartH&&h<rushEndH).length
        const total=avail.length
        const fair=-(assignCount[id]||0)
        return rush*1000+total*100+supOverlap*10+fair`,
  `        const supOverlap=(sup1Info?avail.filter((h:number)=>h>=sup1Info.startH&&h<sup1Info.endH).length:0)+(sup2Info?avail.filter((h:number)=>h>=sup2Info.startH&&h<sup2Info.endH).length:0)
        const rush=avail.filter((h:number)=>h>=rushStartH&&h<rushEndH).length
        // Closing coverage - staff available till midnight is valuable for PM shift
        const closingHours=avail.filter((h:number)=>h>=21&&h<24).length
        const total=avail.length
        const fair=-(assignCount[id]||0)
        return rush*1000+closingHours*200+total*100+supOverlap*10+fair`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
