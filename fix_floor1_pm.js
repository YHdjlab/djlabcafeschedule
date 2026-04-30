const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Apply forcePM logic to BOTH floor staff (not just floor2)
// If a floor staff has good evening availability, push them to PM
ap = ap.replace(
  `          floor_staff1_id&&{id:floor_staff1_id,role:'Floor',info:getStaffHours(floor_staff1_id,dateStr,rushStartH,rushEndH)},
          floor_staff2_id&&{id:floor_staff2_id,role:'Floor',info:forcePMForFloor2(floor_staff2_id)||getStaffHours(floor_staff2_id,dateStr,rushStartH,rushEndH)},`,
  `          floor_staff1_id&&{id:floor_staff1_id,role:'Floor',info:forcePMForFloor2(floor_staff1_id)||getStaffHours(floor_staff1_id,dateStr,rushStartH,rushEndH)},
          floor_staff2_id&&{id:floor_staff2_id,role:'Floor',info:forcePMForFloor2(floor_staff2_id)||getStaffHours(floor_staff2_id,dateStr,rushStartH,rushEndH)},`
);

// Also apply to bar staff if they have good evening availability AND someone else covers AM
// Actually the issue is: if both floor staff get PM, then we need to make sure SOMEONE covers AM
// The bar staff Cynthia is fully available - she should stay AM since she covers opening

// Better rule: if we have 3+ non-supervisor staff, distribute as 1 AM + 2 PM (rush coverage)
// The PRIMARY (most rush) goes to whoever has best rush availability
// Then the OTHERS try to spread - one AM, rest PM

// Even cleaner: after picking the 3 staff, look at their availability and assign shifts intelligently
// staff[0] = whoever scored highest = likely PM rush coverer
// staff[1] = could be AM opener
// staff[2] = should double-up PM if has evening availability

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
