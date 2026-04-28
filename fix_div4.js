const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
// Lines 86-89 are: </div> </div> </div> </div> - need only 2
const newLines = [...lines.slice(0, 86), "        </div>", "      </div>", ...lines.slice(90)];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("fixed");
