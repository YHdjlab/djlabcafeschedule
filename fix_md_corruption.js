const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Find ALL markdown link corruptions and fix them
const before = (ap.match(/\[[\w.]+\]\(http:\/\/[\w.]+\)/g) || []).length;
console.log("Corruptions found:", before);

ap = ap.replace(/\[([\w.]+)\]\(http:\/\/[\w.]+\)/g, "$1");

const after = (ap.match(/\[[\w.]+\]\(http:\/\/[\w.]+\)/g) || []).length;
console.log("Corruptions remaining:", after);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");

// Also check availability-grid
let ag = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
const beforeAG = (ag.match(/\[[\w.]+\]\(http:\/\/[\w.]+\)/g) || []).length;
console.log("AG corruptions found:", beforeAG);
ag = ag.replace(/\[([\w.]+)\]\(http:\/\/[\w.]+\)/g, "$1");
fs.writeFileSync("src/components/schedule/availability-grid.tsx", ag, "utf8");

console.log("done");
