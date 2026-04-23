const fs = require("fs");

// Fix swap-manager - replace lines 67 and 83 directly
let sm = fs.readFileSync("src/components/schedule/swap-manager.tsx", "utf8");
let smLines = sm.split("\n");
for (let i = 0; i < smLines.length; i++) {
  if (smLines[i].includes(".select(*,")) {
    smLines[i] = smLines[i].replace(".select(*,", ".select(\"*,").replace(").single()", "\").single()");
    console.log("swap fixed line " + (i+1));
  }
}
fs.writeFileSync("src/components/schedule/swap-manager.tsx", smLines.join("\n"), "utf8");

// Fix availability-grid line 59 - map key template literal
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
let agLines = ag.split("\n");
for (let i = 0; i < agLines.length; i++) {
  if (agLines[i].includes("map[${") || agLines[i].includes("map[" + String.fromCharCode(36) + "{")) {
    console.log("avail line " + (i+1) + " BEFORE: " + agLines[i]);
    agLines[i] = agLines[i].replace(/map\[\$\{([^}]+)\}_\]/, "map[a.week_starting + \"_\" + a.slot_key]");
    agLines[i] = agLines[i].replace(/= a\.available/, "= a.available");
    console.log("avail line " + (i+1) + " AFTER:  " + agLines[i]);
  }
}
fs.writeFileSync("src/components/schedule/availability-grid.tsx", agLines.join("\n"), "utf8");

// Fix attendance-manager line 137 - dash issue
let at = fs.readFileSync("src/components/schedule/attendance-manager.tsx", "utf8");
let atLines = at.split("\n");
for (let i = 0; i < atLines.length; i++) {
  if (atLines[i].includes("checkin_time}") && atLines[i].includes("checkout_time ?")) {
    console.log("att line " + (i+1) + " BEFORE: " + atLines[i]);
    atLines[i] = "                  {rec.checkin_time}{rec.checkout_time ? \" - \" + rec.checkout_time : \"\"}";
    console.log("att line " + (i+1) + " AFTER:  " + atLines[i]);
  }
}
fs.writeFileSync("src/components/schedule/attendance-manager.tsx", atLines.join("\n"), "utf8");

console.log("All targeted fixes applied");

