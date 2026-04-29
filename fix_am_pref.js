const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Replace smart shift assignment to prefer AM for fully-flexible staff when another sup covers PM
ap = ap.replace(
  `    // Try AM (8-16), MID (12-20), PM (16-24) - pick best fit
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
    }`,
  `    // Try AM (8-16), MID (12-20), PM (16-24) - pick best fit
    const SHIFTS=[{s:8,e:16},{s:12,e:20},{s:16,e:24}]
    let bestShift=null
    let bestScore=-1

    for(const shift of SHIFTS){
      const covered=avail.filter(h=>h>=shift.s&&h<shift.e)
      if(covered.length<4)continue // need at least 4h overlap
      const rushCovered=covered.filter(h=>h>=rushStartH&&h<rushEndH).length
      const score=covered.length+rushCovered*2
      if(score>bestScore){bestScore=score;bestShift=shift}
    }

    // If staff is fully flexible (covers all shifts equally), prefer AM
    if(bestShift&&avail.length>=14){bestShift={s:8,e:16}}`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
