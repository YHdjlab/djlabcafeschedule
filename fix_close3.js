const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
// Line 609 is )} - need to add </div> before ) and }
// Current: 609: )}  610: )  611: }
// Should be: 609: )}  610: </div>  611: )  612: }
const newLines = [
  ...lines.slice(0, 609),
  "      )}",
  "    </div>",
  "  )",
  "}",
  "",
  ...lines.slice(613)
];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("fixed");
