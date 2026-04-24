const fs = require("fs");

// Update utils.ts - remove admin role, use is_admin flag
let utils = fs.readFileSync("src/lib/utils.ts", "utf8");
utils = utils.replace(
  "export function isAdmin(role: string) {\n  return ['gm', 'admin', 'supervisor_floor', 'supervisor_bar'].includes(role)\n}",
  "export function isAdmin(role: string, is_admin?: boolean) {\n  return is_admin === true || ['gm', 'supervisor_floor', 'supervisor_bar'].includes(role)\n}"
);
utils = utils.replace(
  "export function isGM(role: string) {\n  return role === 'gm' || role === 'admin'\n}",
  "export function isGM(role: string, is_admin?: boolean) {\n  return role === 'gm' || is_admin === true\n}"
);
// Remove admin from ROLE_LABELS and ROLE_COLORS
utils = utils.replace("  admin: 'Admin',\n", "");
utils = utils.replace("  admin: 'bg-purple-100 text-purple-800',\n", "");
fs.writeFileSync("src/lib/utils.ts", utils, "utf8");
console.log("utils.ts updated");

// Update all pages to pass is_admin to isAdmin/isGM checks
const pages = [
  "src/app/(dashboard)/dashboard/page.tsx",
  "src/app/(dashboard)/schedule/page.tsx",
  "src/app/(dashboard)/admin/page.tsx",
  "src/app/(dashboard)/swaps/page.tsx",
  "src/app/(dashboard)/attendance/page.tsx",
  "src/app/(dashboard)/days-off/page.tsx",
];
pages.forEach(p => {
  try {
    let c = fs.readFileSync(p, "utf8");
    // Replace isAdmin check to include is_admin flag
    c = c.replace(
      /const isAdmin = \['gm', 'admin', 'supervisor_floor', 'supervisor_bar'\]\.includes\(profile\.role\)/g,
      "const isAdmin = ['gm', 'supervisor_floor', 'supervisor_bar'].includes(profile.role) || profile.is_admin === true"
    );
    fs.writeFileSync(p, c, "utf8");
    console.log("Updated:", p);
  } catch(e) { console.log("Skipped:", p, e.message); }
});

// Update admin panel role options - remove admin role
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
ap = ap.replace("  { value: 'admin', label: 'Admin' },\n", "");
// Fix isGM checks
ap = ap.replace(/\['gm','admin'\]\.includes\(profile\.role\)/g, "profile.role === 'gm' || profile.is_admin === true");
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("admin-panel.tsx updated");

console.log("Done - is_admin flag approach applied everywhere");
