const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix swap - when swapping A with B:
// 1. B takes A's role
// 2. A becomes Available (bench) instead of disappearing
ap = ap.replace(
  `                              // Replace member, remove new person from bench if they were there
                              const newStaff = gs.staff
                                .map((m: any) => m.id === member.id ? { ...m, id: newId, info: newInfo } : m)
                                .filter((m: any, idx: number, arr: any[]) => arr.findIndex((x: any) => x.id === m.id) === idx)`,
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
                              if (!alreadyInStaff) newStaff.push(oldMember)`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
