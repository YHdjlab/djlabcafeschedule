const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

ap = ap.replace(
  `                              // Swap: new person takes role, old person becomes Available
                              const oldMember = { id: member.id, role: 'Available', info: member.info }
                              const newStaff = gs.staff
                                .map((m: any) => {
                                  if (m.id === member.id) return { ...m, id: newId, info: newInfo } // new person takes role
                                  if (m.id === newId) return null // remove from bench
                                  return m
                                })
                                .filter(Boolean)
                              // Add old person to bench if not already there
                              const alreadyInStaff = newStaff.some((m: any) => m.id === oldMember.id)
                              if (!alreadyInStaff) newStaff.push(oldMember)`,
  `                              // Swap: new person takes role, old person becomes Available
                              const oldMember = { id: member.id, role: 'Available', info: member.info }
                              const newStaff = gs.staff
                                .map((m: any) => {
                                  if (m.id === member.id) return { ...m, id: newId, info: newInfo } // new person takes role
                                  if (m.id === newId) return null // remove from bench
                                  return m
                                })
                                .filter(Boolean)
                              // Add old person to bench if not already there
                              const alreadyInStaff = newStaff.some((m: any) => m.id === oldMember.id)
                              if (!alreadyInStaff) newStaff.push(oldMember)
                              // Update the slot IDs too
                              const updated = fieldName === '__bench__' ? gs : { ...gs, [fieldName]: newId }`
);

// Fix: the updated variable was defined but the return used spread wrongly
// Find the return statement and fix it
ap = ap.replace(
  `                              const updated = fieldName === '__bench__' ? gs : { ...gs, [fieldName]: newId }
                              return { ...updated, staff: newStaff }`,
  `                              return { ...(fieldName === '__bench__' ? gs : { ...gs, [fieldName]: newId }), staff: newStaff }`
);

// Remove the old duplicate updated line that was there before
ap = ap.replace(
  `                              const updated = { ...gs, [fieldName]: newId }
                              return { ...(fieldName === '__bench__' ? gs : { ...gs, [fieldName]: newId }), staff: newStaff }`,
  `                              return { ...(fieldName === '__bench__' ? gs : { ...gs, [fieldName]: newId }), staff: newStaff }`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
