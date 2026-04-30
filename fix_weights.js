const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix 1: Make rush score completely dominant - if you don't cover rush, you score very low
// Also drop fairness weight - we care about COVERAGE first, fairness within tied scores
ap = ap.replace(
  `        return supOverlap*100 + rush*10 + total*2 + fair`,
  `        // Rush coverage is CRITICAL - 1000x weight
        // Total available hours is next - 100x
        // Then sup overlap - 10x
        // Then fairness as tiebreaker
        return rush*1000 + total*100 + supOverlap*10 + fair`
);

// Fix 2: getStaffHours bug for Lucciana showing 4pm instead of 3pm
// The issue: when checking PM shift (16-24), Lucciana has h=15 which is BEFORE 16
// So PM shift starts at 16, missing her 3pm hour
// Fix: also try a shift starting at 15 (mid-late afternoon)
ap = ap.replace(
  `    const SHIFTS=[{s:8,e:16},{s:12,e:20},{s:16,e:24}]`,
  `    const SHIFTS=[{s:8,e:16},{s:12,e:20},{s:15,e:23},{s:16,e:24}]`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
