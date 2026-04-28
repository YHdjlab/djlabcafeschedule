const fs = require("fs");

// Move page header inside the dark panel
let adminPage = fs.readFileSync("src/app/(dashboard)/admin/page.tsx", "utf8");
adminPage = adminPage.replace(
  `    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#323232] tracking-tight">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-1">Manage staff, schedules, and system settings</p>
      </div>
      <AdminPanel`,
  `    <div>
      <AdminPanel`
);
fs.writeFileSync("src/app/(dashboard)/admin/page.tsx", adminPage, "utf8");
console.log("admin page header removed");

// Make admin panel start with header inside dark bg
let panel = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
panel = panel.replace(
  `  return (
    <div style={{ backgroundColor: BG, borderRadius: '0', padding: '0', minHeight: '600px' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '24px' }}>`,
  `  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', margin: '-24px -32px', padding: '0' }}>
      {/* Header */}
      <div style={{ padding: '24px 32px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0' }}>
        <h1 style={{ color: CREAM, fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Admin Panel</h1>
        <p style={{ color: MUTED, fontSize: '13px', marginBottom: '16px' }}>Manage staff, schedules, and system settings</p>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', paddingBottom: '0' }}>`
);

// Close the header div after tabs
panel = panel.replace(
  `      {tab === 'overview' && <OverviewTab`,
  `        </div>
      </div>
      <div style={{ padding: '24px 32px' }}>
      {tab === 'overview' && <OverviewTab`
);

// Close the content div at end
panel = panel.replace(
  `    </div>
  )
}

function Stat`,
  `      </div>
    </div>
  )
}

function Stat`
);

fs.writeFileSync("src/components/schedule/admin-panel.tsx", panel, "utf8");
console.log("admin panel header integrated");
