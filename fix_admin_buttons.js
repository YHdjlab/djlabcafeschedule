const fs = require("fs");
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");

// 1. Tab buttons - clean pill style
ap = ap.replace(
  `'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              tab === t.id ? 'bg-[#FF6357] text-white shadow-sm' : 'bg-white text-gray-500 hover:bg-black/5'`,
  `'flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all border',
              tab === t.id ? 'bg-[#FF6357] text-white shadow-sm border-[#FF6357]' : 'bg-white text-gray-400 hover:text-[#323232] hover:bg-black/5 border-black/5'`
);

// 2. Save and Submit button
ap = ap.replace(
  `className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#FF6357] text-white text-sm font-bold hover:bg-[#e5554a] active:scale-[0.98] transition-all disabled:opacity-50 shadow-md hover:shadow-lg whitespace-nowrap"`,
  `style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 20px',borderRadius:'14px',backgroundColor:'#FF6357',color:'white',fontSize:'13px',fontWeight:'700',border:'none',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0,boxShadow:'0 2px 8px rgba(255,99,87,0.35)'}}`
);

// 3. Generate schedule button
ap = ap.replace(
  /className="flex items-center gap-2 px-5 py-2\.5 rounded-2xl bg-\[#FF6357\] text-white text-sm font-bold hover:bg-\[#e5554a\] transition-all shadow-sm whitespace-nowrap"/g,
  `style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 20px',borderRadius:'14px',backgroundColor:'#FF6357',color:'white',fontSize:'13px',fontWeight:'700',border:'none',cursor:'pointer',whiteSpace:'nowrap',boxShadow:'0 2px 8px rgba(255,99,87,0.35)'}}`
);

// 4. Approve/Deny buttons in approvals tab
ap = ap.replace(
  /className="[^"]*bg-green-500[^"]*text-white[^"]*rounded[^"]*"/g,
  `style={{padding:'6px 14px',borderRadius:'10px',backgroundColor:'#22c55e',color:'white',fontSize:'12px',fontWeight:'600',border:'none',cursor:'pointer',whiteSpace:'nowrap'}}`
);
ap = ap.replace(
  /className="[^"]*bg-red-500[^"]*text-white[^"]*rounded[^"]*"/g,
  `style={{padding:'6px 14px',borderRadius:'10px',backgroundColor:'#ef4444',color:'white',fontSize:'12px',fontWeight:'600',border:'none',cursor:'pointer',whiteSpace:'nowrap'}}`
);

// 5. Schedule Preview header
ap = ap.replace(
  `<div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-4 flex items-center justify-between gap-4">`,
  `<div style={{backgroundColor:'white',borderRadius:'16px',border:'1px solid rgba(0,0,0,0.06)',boxShadow:'0 1px 3px rgba(0,0,0,0.06)',padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px'}}>`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("done");
