const fs = require("fs");
const ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
console.log("Line 686:", JSON.stringify(lines[685]));
console.log("Line 687:", JSON.stringify(lines[686]));

// Look for any remaining corruption patterns
const patterns = [
  /\[\w[\w.]*\]\(http/g,
  /\[s\.id\]/g,
  /\[DAYS\.map\]/g,
  /\[member\.id\]/g,
];
patterns.forEach(p => {
  const m = ap.match(p);
  if (m) console.log("Pattern", p, "found", m.length, "times");
});
