const fs = require("fs");

// 1. Update utils.ts - supervisors get GM privileges
let utils = fs.readFileSync("src/lib/utils.ts", "utf8");
utils = utils.replace(
  "export function isGM(role: string) {\n  return role === 'gm' || role === 'admin'\n}",
  "export function isGM(role: string) {\n  return ['gm', 'admin', 'supervisor_floor', 'supervisor_bar'].includes(role)\n}"
);
utils = utils.replace(
  "export function isAdmin(role: string) {\n  return ['gm', 'admin', 'supervisor_floor', 'supervisor_bar'].includes(role)\n}",
  "export function isAdmin(role: string) {\n  return ['gm', 'admin', 'supervisor_floor', 'supervisor_bar'].includes(role)\n}"
);
fs.writeFileSync("src/lib/utils.ts", utils, "utf8");
console.log("utils.ts updated");

// 2. Update all isGM checks across pages
const files = [
  "src/components/schedule/admin-panel.tsx",
  "src/app/(dashboard)/admin/page.tsx",
  "src/app/(dashboard)/dashboard/page.tsx",
  "src/app/(dashboard)/schedule/page.tsx",
  "src/app/(dashboard)/swaps/page.tsx",
  "src/app/(dashboard)/days-off/page.tsx",
  "src/app/(dashboard)/attendance/page.tsx",
  "src/proxy.ts",
];

files.forEach(f => {
  try {
    let content = fs.readFileSync(f, "utf8");
    let changed = false;

    // Replace all isGM/isAdmin checks to include supervisors
    const replacements = [
      ["profile.role === 'gm'", "['gm','admin','supervisor_floor','supervisor_bar'].includes(profile.role)"],
      ["['gm','admin'].includes(profile.role)", "['gm','admin','supervisor_floor','supervisor_bar'].includes(profile.role)"],
      ["role === 'gm' || role === 'admin'", "['gm','admin','supervisor_floor','supervisor_bar'].includes(role)"],
    ];

    replacements.forEach(([from, to]) => {
      if (content.includes(from)) { content = content.split(from).join(to); changed = true; }
    });

    if (changed) { fs.writeFileSync(f, content, "utf8"); console.log("Updated:", f); }
  } catch(e) { console.log("Skip:", f); }
});

console.log("Done");
