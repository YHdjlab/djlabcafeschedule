const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

ap = ap.replace(
  `                                    left: Math.max(0, (info.startH - 8) / 16 * 100) + '%',
                                    width: Math.min(100, (info.totalH / 16 * 100)) + '%',`,
  `                                    left: Math.max(0, (info.startH - 8) / 16 * 100) + '%',
                                    width: Math.min(100 - Math.max(0, (info.startH - 8) / 16 * 100), (info.totalH / 16 * 100)) + '%',`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("fixed");
