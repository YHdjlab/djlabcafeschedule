const fs = require("fs");
let s = fs.readFileSync("seed_shifts.js", "utf8");
s = s.replace(/,\s*submitted: true,/g, ',');
s = s.replace(/,\s*submitted: true\s*}/g, '}');
fs.writeFileSync("seed_shifts.js", s, "utf8");
console.log("removed submitted field");
