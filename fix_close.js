const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
// Remove lines 607-611 and replace with correct closing
const newLines = [
  ...lines.slice(0, 606),
  "        </button>",
  "      )}",
  ...lines.slice(613)
];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("fixed");
