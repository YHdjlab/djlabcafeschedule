const fs = require("fs");
let dp = fs.readFileSync("src/app/(dashboard)/dashboard/page.tsx", "utf8");

// Fix outer wrapper
dp = dp.replace(
  '<div className="space-y-5 max-w-5xl mx-auto">',
  '<div style={{display:"flex",flexDirection:"column",gap:"20px"}}>'
);

// Fix hero card
dp = dp.replace(
  '<div className="relative overflow-hidden rounded-3xl bg-[#323232] p-6 lg:p-8">',
  '<div style={{position:"relative",overflow:"hidden",borderRadius:"20px",background:"linear-gradient(135deg,#2a2a2a,#1a1a1a)",padding:"28px 32px",border:"1px solid rgba(255,255,255,0.08)"}}>'
);

// Quick actions label
dp = dp.replace(
  '<p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">Quick Actions</p>',
  '<p style={{color:"rgba(247,240,232,0.35)",fontSize:"11px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"12px"}}>Quick Actions</p>'
);

// Fix stat colors - still using old Tailwind classes
dp = dp.replace(
  `{ label: 'Active Staff', value: staffCount || 0, icon: <Users size={15}/>, color: 'text-blue-500', bg: 'bg-blue-50' },`,
  `{ label: 'Active Staff', value: staffCount || 0, icon: <Users size={15}/>, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },`
);
dp = dp.replace(
  `{ label: 'Swap Requests', value: pendingSwaps?.length || 0, icon: <ArrowLeftRight size={15}/>, color: 'text-purple-500', bg: 'bg-purple-50' },`,
  `{ label: 'Swap Requests', value: pendingSwaps?.length || 0, icon: <ArrowLeftRight size={15}/>, color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },`
);
dp = dp.replace(
  `{ label: 'Days Off', value: pendingDaysOff?.length || 0, icon: <CalendarOff size={15}/>, color: 'text-green-500', bg: 'bg-green-50' },`,
  `{ label: 'Days Off', value: pendingDaysOff?.length || 0, icon: <CalendarOff size={15}/>, color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },`
);
dp = dp.replace(
  `{ label: 'Punch-In Queue', value: pendingAttendance?.length || 0, icon: <CheckSquare size={15}/>, color: 'text-[#FF6357]', bg: 'bg-orange-50' },`,
  `{ label: 'Punch-In Queue', value: pendingAttendance?.length || 0, icon: <CheckSquare size={15}/>, color: '#FF6357', bg: 'rgba(255,99,87,0.12)' },`
);

// Fix stat card icon div - still using className
dp = dp.replace(
  `<div className={\`p-1.5 rounded-lg \${stat.bg} \${stat.color}\`}>{stat.icon}</div>`,
  `<div style={{padding:"6px",borderRadius:"8px",backgroundColor:stat.bg,color:stat.color}}>{stat.icon}</div>`
);

// Fix stat label/value
dp = dp.replace(
  `<span className="text-xs font-medium text-gray-400">{stat.label}</span>`,
  `<span style={{color:"rgba(247,240,232,0.4)",fontSize:"11px",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{stat.label}</span>`
);
dp = dp.replace(
  `<p className="text-3xl font-bold text-[#323232]">{stat.value}</p>`,
  `<p style={{color:"#F7F0E8",fontSize:"28px",fontWeight:800}}>{stat.value}</p>`
);

// Fix grid wrapper for stats
dp = dp.replace(
  '<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">',
  '<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"12px"}}>'
);

// Fix quick actions grid
dp = dp.replace(
  '<div className="grid grid-cols-3 lg:grid-cols-6 gap-3">',
  '<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(90px,1fr))",gap:"10px"}}>'
);

fs.writeFileSync("src/app/(dashboard)/dashboard/page.tsx", dp, "utf8");
console.log("done");
