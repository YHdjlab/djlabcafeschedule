const fs = require("fs");
let seed = fs.readFileSync("seed2.js", "utf8");
seed = seed.replace(
  "const weekStart = getNextMonday();",
  "const weekStart = new Date('2026-04-27T00:00:00');"
);
seed = seed.replace(
  'await supabase.from("availability").delete().eq("week_starting", "2026-04-26");',
  'await supabase.from("availability").delete().neq("id","00000000-0000-0000-0000-000000000000");'
);
fs.writeFileSync("seed2.js", seed, "utf8");
console.log("fixed");
