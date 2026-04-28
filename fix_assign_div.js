const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// Fix the structure - close the inner div before the assign/swap selects
ap = ap.replace(
  `                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                            <span className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", roleBg, roleTextColor, "border")}>{member.role}</span>
                            {info && <span className="text-xs font-bold text-[#FF6357]">{info.totalH}h</span>}
                          {member.role === 'Available' ? (`,
  `                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#323232]">{s.full_name?.split(' ')[0]}</p>
                            <span className={cn("text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full", roleBg, roleTextColor, "border")}>{member.role}</span>
                            {info && <span className="text-xs font-bold text-[#FF6357]">{info.totalH}h</span>}
                          </div>
                          {member.role === 'Available' ? (`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
