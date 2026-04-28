const fs = require("fs");
let page = fs.readFileSync("src/app/(dashboard)/admin/page.tsx", "utf8");
page = page.replace(
  `  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#323232]">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-1">Manage staff, schedules, and system settings</p>
      </div>
      <AdminPanel`,
  `  return (
    <div>
      <AdminPanel`
);
page = page.replace(
  `      />
    </div>
  )`,
  `      />
    </div>
  )`
);
fs.writeFileSync("src/app/(dashboard)/admin/page.tsx", page, "utf8");
console.log("done");
