const fs = require("fs");
let grid = fs.readFileSync("src/components/schedule/availability-grid.tsx", "utf8");
grid = grid.replace(
  "interface Props {\n  profile: any\n  availability: any[]\n  nextMonday: string\n  currentMonday: string\n  rushConfig: any[]\n}",
  "interface Props {\n  profile: any\n  availability: any[]\n  schedules: any[]\n  nextMonday: string\n  currentMonday: string\n  rushConfig: any[]\n}"
);
fs.writeFileSync("src/components/schedule/availability-grid.tsx", grid, "utf8");
console.log("fixed");
