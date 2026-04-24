const fs = require("fs");

// 1. Update utils.ts - add admin role
let utils = fs.readFileSync("src/lib/utils.ts", "utf8");
utils = utils.replace(
  "export const ROLE_LABELS: Record<string, string> = {\n  gm: 'General Manager',\n  supervisor_floor: 'Supervisor (Floor)',\n  supervisor_bar: 'Supervisor (Bar)',\n  floor: 'Floor Staff',\n  bar: 'Bar Staff',\n}",
  "export const ROLE_LABELS: Record<string, string> = {\n  gm: 'General Manager',\n  admin: 'Admin',\n  supervisor_floor: 'Supervisor (Floor)',\n  supervisor_bar: 'Supervisor (Bar)',\n  floor: 'Floor Staff',\n  bar: 'Bar Staff',\n}"
);
utils = utils.replace(
  "export const ROLE_COLORS: Record<string, string> = {\n  gm: 'bg-purple-100 text-purple-800',\n  supervisor_floor: 'bg-blue-100 text-blue-800',\n  supervisor_bar: 'bg-indigo-100 text-indigo-800',\n  floor: 'bg-green-100 text-green-800',\n  bar: 'bg-orange-100 text-orange-800',\n}",
  "export const ROLE_COLORS: Record<string, string> = {\n  gm: 'bg-purple-100 text-purple-800',\n  admin: 'bg-purple-100 text-purple-800',\n  supervisor_floor: 'bg-blue-100 text-blue-800',\n  supervisor_bar: 'bg-indigo-100 text-indigo-800',\n  floor: 'bg-green-100 text-green-800',\n  bar: 'bg-orange-100 text-orange-800',\n}"
);
utils = utils.replace(
  "export function isAdmin(role: string) {\n  return ['gm', 'supervisor_floor', 'supervisor_bar'].includes(role)\n}",
  "export function isAdmin(role: string) {\n  return ['gm', 'admin', 'supervisor_floor', 'supervisor_bar'].includes(role)\n}"
);
utils = utils.replace(
  "export function isGM(role: string) {\n  return role === 'gm'\n}",
  "export function isGM(role: string) {\n  return role === 'gm' || role === 'admin'\n}"
);
fs.writeFileSync("src/lib/utils.ts", utils, "utf8");
console.log("utils.ts updated");

// 2. Update admin panel - add admin to role options and isAdmin checks
let ap = fs.readFileSync("src/components/schedule/admin-panel.tsx", "utf8");
ap = ap.replace(
  "const ROLE_OPTIONS = [\n  { value: 'floor', label: 'Floor Staff' },\n  { value: 'bar', label: 'Bar Staff' },\n  { value: 'supervisor_floor', label: 'Supervisor (Floor)' },\n  { value: 'supervisor_bar', label: 'Supervisor (Bar)' },\n  { value: 'gm', label: 'General Manager' },\n]",
  "const ROLE_OPTIONS = [\n  { value: 'floor', label: 'Floor Staff' },\n  { value: 'bar', label: 'Bar Staff' },\n  { value: 'supervisor_floor', label: 'Supervisor (Floor)' },\n  { value: 'supervisor_bar', label: 'Supervisor (Bar)' },\n  { value: 'admin', label: 'Admin' },\n  { value: 'gm', label: 'General Manager' },\n]"
);
// Admin gets same privileges as GM throughout
ap = ap.replace(/profile\.role === 'gm'/g, "['gm','admin'].includes(profile.role)");
fs.writeFileSync("src/components/schedule/admin-panel.tsx", ap, "utf8");
console.log("admin-panel.tsx updated");

// 3. Update all dashboard pages isAdmin checks
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
    let content = fs.readFileSync(p, "utf8");
    content = content.replace(
      /\['gm', 'supervisor_floor', 'supervisor_bar'\]/g,
      "['gm', 'admin', 'supervisor_floor', 'supervisor_bar']"
    );
    fs.writeFileSync(p, content, "utf8");
    console.log("Updated:", p);
  } catch(e) { console.log("Skipped:", p); }
});

// 4. Update proxy.ts auth
try {
  let proxy = fs.readFileSync("src/proxy.ts", "utf8");
  proxy = proxy.replace(
    /\['gm', 'supervisor_floor', 'supervisor_bar'\]/g,
    "['gm', 'admin', 'supervisor_floor', 'supervisor_bar']"
  );
  fs.writeFileSync("src/proxy.ts", proxy, "utf8");
  console.log("proxy.ts updated");
} catch(e) {}

// 5. Update register page role options
try {
  let reg = fs.readFileSync("src/app/(auth)/register/page.tsx", "utf8");
  reg = reg.replace(
    "{ value: 'gm', label: 'General Manager' }",
    "{ value: 'admin', label: 'Admin' },\n  { value: 'gm', label: 'General Manager' }"
  );
  fs.writeFileSync("src/app/(auth)/register/page.tsx", reg, "utf8");
  console.log("register page updated");
} catch(e) {}

console.log("All done");
