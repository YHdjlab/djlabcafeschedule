const fs = require("fs");
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
let lines = ag.split("\n");

for (let i = 0; i < lines.length; i++) {
  const L = lines[i];
  // Line 90: updates[${weekStart}_] = value  -> inside forEach with s
  if (L.includes("updates[${weekStart}_]")) {
    lines[i] = L.replace("updates[${weekStart}_]", "updates[weekStart + \"_\" + s.key]");
    console.log("Fixed line " + (i+1));
  }
  // Line 105: localAvail[${weekStart}_] inside filter with s
  if (L.includes("localAvail[${weekStart}_]") && L.includes("filter(s =>")) {
    lines[i] = L.replace("localAvail[${weekStart}_]", "localAvail[weekStart + \"_\" + s.key]");
    console.log("Fixed line " + (i+1));
  }
  // Lines 137/138: localAvail[${weekStart}_] inside every/some with s
  if (L.includes("localAvail[${weekStart}_]") && (L.includes("every(s =>") || L.includes("some(s =>"))) {
    lines[i] = L.replace("localAvail[${weekStart}_]", "localAvail[weekStart + \"_\" + s.key]");
    console.log("Fixed line " + (i+1));
  }
}

fs.writeFileSync("src/components/schedule/availability-grid.tsx", lines.join("\n"), "utf8");

// Final scan
let remaining = false;
lines.forEach((line, i) => {
  if (line.includes("${weekStart}_") || line.includes("${")) {
    console.log("STILL BROKEN line " + (i+1) + ": " + line.trim());
    remaining = true;
  }
});
if (!remaining) console.log("availability-grid fully clean");

