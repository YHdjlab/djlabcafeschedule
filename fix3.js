const fs = require("fs");

// Fix availability-grid line 69 and all remaining template literals
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
let agLines = ag.split("\n");
for (let i = 0; i < agLines.length; i++) {
  const L = agLines[i];
  if (L.includes("weekStart}_") || L.includes("weekStart}_s") || L.includes("slot.key}")) {
    console.log("AG line " + (i+1) + " BEFORE: " + L.trim());
    agLines[i] = L
      .replace(/\$\{weekStart\}_\$\{slot\.key\}/g, "\" + weekStart + \"_\" + slot.key + \"")
      .replace(/const key = \$\{weekStart\}_$/,     "const key = weekStart + \"_\" + slot.key")
      .replace(/const key = \$\{weekStart\}_\s*$/,   "const key = weekStart + \"_\" + slot.key")
      .replace(/weekStart \+ "_" \+ slot\.key \+ ""\}/,"weekStart + \"_\" + slot.key}")
      .replace(/map\[\$\{weekStart\}_\$\{[^}]+\}\]/g,"map[weekStart + \"_\" + slot.key]");
    console.log("AG line " + (i+1) + " AFTER:  " + agLines[i].trim());
  }
}
fs.writeFileSync("src/components/schedule/availability-grid.tsx", agLines.join("\n"), "utf8");

// Fix swap-manager line 145 - dash between shift_date and shift_label
let sm = fs.readFileSync("src/components/schedule/swap-manager.tsx", "utf8");
let smLines = sm.split("\n");
for (let i = 0; i < smLines.length; i++) {
  if (smLines[i].includes("shift_label &&") && smLines[i].includes(" - ")) {
    console.log("SM line " + (i+1) + " BEFORE: " + smLines[i].trim());
    smLines[i] = "                      {swap.shift_label && \" - \" + swap.shift_label}";
    console.log("SM line " + (i+1) + " AFTER:  " + smLines[i].trim());
  }
}
fs.writeFileSync("src/components/schedule/swap-manager.tsx", smLines.join("\n"), "utf8");

// Scan all target files for any remaining broken template literals
const targets = [
  "src/components/schedule/availability-grid.tsx",
  "src/components/schedule/swap-manager.tsx",
  "src/components/schedule/attendance-manager.tsx",
  "src/app/(dashboard)/dashboard/page.tsx",
];
let anyLeft = false;
targets.forEach(f => {
  const lines = fs.readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    const b = Buffer.from(line, "utf8");
    let hasBad = false;
    for (let j = 0; j < b.length; j++) { if (b[j] > 127) hasBad = true; }
    if (hasBad || line.match(/\$\{/) || line.match(/\.select\(\*,/) || line.match(/ - \s*\}/)) {
      console.log("ISSUE " + f + " line " + (i+1) + ": " + line.trim());
      anyLeft = true;
    }
  });
});
if (!anyLeft) console.log("No more issues found");

