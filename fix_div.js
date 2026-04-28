const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
// Line 732 closes the info ternary, line 733 should close timeline div, line 734 closes card div
// Current: 732: )}  733: </div>  734: </div>  735: </>
// Need:    732: )}  733: </div>  734: </div>  735: </div>  736: </>
const newLines = [
  ...lines.slice(0, 733),
  "                        </div>",  // close timeline wrapper div
  ...lines.slice(733)
];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("fixed, lines:", newLines.length);
