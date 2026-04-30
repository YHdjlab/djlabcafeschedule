const fs = require("fs");
const ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
// Look for markdown link corruption
const matches = ap.match(/\[[\w.]+\]\(http:\/\/[\w.]+\)/g);
if (matches) {
  console.log("CORRUPTION FOUND:", matches.length, "instances");
  matches.slice(0, 5).forEach(m => console.log(" ", m));
} else {
  console.log("No corruption found");
}
