const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Add unassign button for assigned staff - moves them back to bench
// Find the top row of the staff card and add unassign for non-core staff
// Core = the original 4 (supervisor, bar, floor1, floor2) from auto-generate
// Extra = anyone added via + Assign

// Add an X/unassign button next to swap for assigned staff
ap = ap.replace(
  `                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                            <span className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", roleBg, roleTextColor, "border")}>{member.role}</span>
                            {info && <span className="text-xs font-bold text-[#FF6357]">{info.totalH}h</span>}
                          </div>`,
  `                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                            <span className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", roleBg, roleTextColor, "border")}>{member.role}</span>
                            {info && <span className="text-xs font-bold text-[#FF6357]">{info.totalH}h</span>}
                          </div>
                          {/* Unassign button - move back to bench */}
                          {member.role !== 'Available' && (
                            <button onClick={() => {
                              setGeneratedSlots((prev: any[]) => prev.map((gs: any) => {
                                if (gs.key !== slot.key) return gs
                                const updated = { ...gs, [fieldName]: null }
                                const newStaff = gs.staff.map((m: any) =>
                                  m.id === member.id ? { ...m, role: 'Available' } : m
                                )
                                return { ...updated, staff: newStaff }
                              }))
                            }} className="w-6 h-6 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center flex-shrink-0 transition-colors text-gray-400 font-bold text-xs">
                              ✕
                            </button>
                          )}`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
