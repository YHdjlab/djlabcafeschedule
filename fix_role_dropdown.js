const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Add role dropdown next to role badge for non-supervisor assigned staff
ap = ap.replace(
  `                            <span className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border", roleBg, roleTextColor)}>{member.role}</span>`,
  `                            {member.role !== 'Available' && member.role !== 'Supervisor' ? (
                              <select value={member.role} onChange={e => {
                                const newRole = e.target.value
                                // Also update the field mapping
                                setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                                  if (gs.key !== slot.key) return gs
                                  const newStaff = gs.staff.map((m: any) => m.id === member.id ? { ...m, role: newRole } : m)
                                  return { ...gs, staff: newStaff }
                                }))
                              }} className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border cursor-pointer", roleBg, roleTextColor)}>
                                <option value="Bar">BAR</option>
                                <option value="Floor">FLOOR</option>
                                <option value="Floor">FLOOR 2</option>
                              </select>
                            ) : (
                              <span className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border", roleBg, roleTextColor)}>{member.role}</span>
                            )}`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
