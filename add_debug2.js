const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
ap = ap.replace(
  "const availSups=byLeast(availStaff.filter(id=>STAFF_MAP[id]?.role==='supervisor'))",
  `console.log('Monday availStaff:', availStaff.map(id=>STAFF_MAP[id]?.full_name+'('+STAFF_MAP[id]?.role+')'))
      console.log('availSups:', byLeast(availStaff.filter(id=>STAFF_MAP[id]?.role==='supervisor')).map(id=>STAFF_MAP[id]?.full_name))
      const availSups=byLeast(availStaff.filter(id=>STAFF_MAP[id]?.role==='supervisor'))`
);
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
