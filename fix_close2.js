const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
// Show context
for (let i = 603; i < 615; i++) console.log(i + ": " + lines[i]);
const newLines = [
  ...lines.slice(0, 610),
  "    </div>",
  "  )",
  "}",
  "",
  ...lines.slice(614)
];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("fixed");
