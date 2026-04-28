const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Available/bench staff should not appear in schedule view page
// They are display-only in builder - not saved to DB as assigned staff
// The save function already only saves supervisor_id, bar_staff_id, floor_staff1_id, floor_staff2_id
// So bench staff are already NOT saved. The issue is just visual clarity.

// Make Available staff visually distinct - add "Not assigned" label and dim them more
ap = ap.replace(
  `                    const roleBg = member.role === 'Supervisor' ? 'bg-blue-50 border-blue-100' : member.role === 'Bar' ? 'bg-purple-50 border-purple-100' : member.role === 'Available' ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-100'`,
  `                    const roleBg = member.role === 'Supervisor' ? 'bg-blue-50 border-blue-100' : member.role === 'Bar' ? 'bg-purple-50 border-purple-100' : member.role === 'Available' ? 'bg-gray-50 border-dashed border-gray-300' : 'bg-green-50 border-green-100'`
);

// Add a separator line between assigned and bench staff
// Find the staff grid and add a label before bench staff
ap = ap.replace(
  `                {/* Staff grid */}
                <div className="px-6 py-4 space-y-3">
                  {(slot.staff || []).map((member: any) => {`,
  `                {/* Staff grid */}
                <div className="px-6 py-4 space-y-3">
                  {(slot.staff || []).map((member: any, memberIdx: number) => {
                    const isFirstBench = member.role === 'Available' && memberIdx > 0 && slot.staff[memberIdx-1]?.role !== 'Available'`
);

// Add separator before first bench member
ap = ap.replace(
  `                    return (
                      <div key={member.id} className={cn("rounded-2xl border px-5 py-4", roleBg)}>`,
  `                    return (
                      <>
                      {isFirstBench && (
                        <div className="flex items-center gap-3 py-1">
                          <div className="flex-1 h-px bg-gray-200"/>
                          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Also available · not assigned</span>
                          <div className="flex-1 h-px bg-gray-200"/>
                        </div>
                      )}
                      <div key={member.id} className={cn("rounded-2xl border px-5 py-4", roleBg, member.role === 'Available' && 'opacity-60')}>`
);

// Close the fragment
ap = ap.replace(
  `                      </div>
                    )
                  })}
                </div>
                {/* Issues */}`,
  `                      </div>
                      </>
                    )
                  })}
                </div>
                {/* Issues */}`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
