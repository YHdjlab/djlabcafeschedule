const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix supervisor filter to include old role names too
ap = ap.replace(
  "const availSups=byLeast(availStaff.filter(id=>STAFF_MAP[id]?.role==='supervisor'))",
  "const availSups=byLeast(availStaff.filter(id=>['supervisor','supervisor_floor','supervisor_bar'].includes(STAFF_MAP[id]?.role)))"
);

// Remove debug logs
ap = ap.replace(
  `console.log('Monday availStaff:', availStaff.map(id=>STAFF_MAP[id]?.full_name+'('+STAFF_MAP[id]?.role+')'))
      console.log('availSups:', byLeast(availStaff.filter(id=>STAFF_MAP[id]?.role==='supervisor')).map(id=>STAFF_MAP[id]?.full_name))
      `, ""
);
ap = ap.replace(
  `console.log('STAFF_MAP keys:', Object.keys(STAFF_MAP).length, Object.values(STAFF_MAP).map((s:any)=>s.full_name+'('+s.role+')'))
  console.log('weekAvailability count:', weekAvailability.length)
  console.log('availability sample:', availability.slice(0,3))`, ""
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
