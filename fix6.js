const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix all remaining implicit any in map/filter/forEach callbacks
const replacements = [
  [/\.map\(slot => \(/g, ".map((slot: any) => ("],
  [/\.map\(slot => \{/g, ".map((slot: any) => {"],
  [/\.map\(stat => \(/g, ".map((stat: any) => ("],
  [/\.map\(item => \(/g, ".map((item: any) => ("],
  [/\.map\(opt => \(/g, ".map((opt: any) => ("],
  [/\.map\(t => \(/g, ".map((t: any) => ("],
  [/\.map\(a => \(/g, ".map((a: any) => ("],
  [/\.map\(a => \{/g, ".map((a: any) => {"],
  [/\.map\(r => r\./g, ".map((r: any) => r."],
  [/\.filter\(slot => /g, ".filter((slot: any) => "],
  [/\.filter\(a => /g, ".filter((a: any) => "],
  [/\.filter\(r => /g, ".filter((r: any) => "],
  [/\.filter\(id => /g, ".filter((id: any) => "],
  [/\.sort\(\(a,b\) => /g, ".sort((a: any, b: any) => "],
  [/\.forEach\(s => /g, ".forEach((s: any) => "],
  [/Object\.fromEntries\(activeStaff\.map\(s => /g, "Object.fromEntries(activeStaff.map((s: any) => "],
  [/Object\.entries\(files\)\.forEach\(\(\[/g, "Object.entries(files).forEach((["],
];

replacements.forEach(([pattern, replacement]) => {
  ap = ap.replace(pattern, replacement);
});

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("Done");

