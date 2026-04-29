const fs = require("fs");
const ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const line = ap.split("\n").find(l => l.includes("STAFF_MAP") && l.includes("fromEntries"));
console.log("RAW LINE:", JSON.stringify(line));
