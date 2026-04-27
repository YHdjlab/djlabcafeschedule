const fs = require("fs");
const path = require("path");

const files = [
  "src/app/(dashboard)/admin/page.tsx",
  "src/app/(dashboard)/dashboard/page.tsx",
  "src/app/(dashboard)/schedule/page.tsx",
  "src/app/(dashboard)/swaps/page.tsx",
  "src/app/(dashboard)/days-off/page.tsx",
  "src/app/(dashboard)/attendance/page.tsx",
  "src/app/(dashboard)/availability/page.tsx",
  "src/components/layout/sidebar.tsx",
  "src/proxy.ts",
  "src/lib/utils.ts",
];

const replacements = [
  // Old admin checks missing 'admin'
  ["['gm', 'supervisor_floor', 'supervisor_bar']", "['gm', 'admin', 'supervisor_floor', 'supervisor_bar']"],
  ["['gm','supervisor_floor','supervisor_bar']", "['gm','admin','supervisor_floor','supervisor_bar']"],
  // isAdmin function
  ["return ['gm', 'supervisor_floor', 'supervisor_bar'].includes(role)", "return ['gm', 'admin', 'supervisor_floor', 'supervisor_bar'].includes(role)"],
  // isGM function - admin gets same as GM
  ["return role === 'gm'", "return role === 'gm' || role === 'admin'"],
  // profile.is_admin fallback - remove it, use role only
  ["|| profile.is_admin === true", ""],
];

let totalFixed = 0;
files.forEach(f => {
  try {
    let content = fs.readFileSync(f, "utf8");
    let changed = false;
    replacements.forEach(([from, to]) => {
      if (content.includes(from)) {
        content = content.split(from).join(to);
        changed = true;
      }
    });
    if (changed) {
      fs.writeFileSync(f, content, "utf8");
      console.log("Fixed:", f);
      totalFixed++;
    }
  } catch(e) { console.log("Skip:", f); }
});
console.log("\nFixed", totalFixed, "files");
