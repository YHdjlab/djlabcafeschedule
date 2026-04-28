const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
const newLines = [...lines.slice(0, 86), "      </div>", ...lines.slice(86)];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("fixed");
