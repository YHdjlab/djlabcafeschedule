const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
const lines = ap.split("\n");
for (let i = 600; i < 615; i++) console.log(i + ": " + lines[i]);
const newLines = [
  ...lines.slice(0, 605),
  `        <button onClick={generateSchedule} disabled={generating}`,
  `          className="w-full py-4 rounded-2xl bg-[#323232] text-white font-semibold text-sm hover:bg-black transition-all disabled:opacity-50">`,
  `          {generating ? 'Generating...' : 'Auto-Generate Schedule from Availability'}`,
  `        </button>`,
  `      )}`,
  ...lines.slice(609)
];
fs.writeFileSync("src/components/schedule/admin-panel.tsx", newLines.join("\n"), "utf8");
console.log("fixed, total lines:", newLines.length);
