const fs = require("fs");
const ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
console.log("Line 686:", JSON.stringify(lines[685]));
