const fs = require('fs');

// Read current files
const css = fs.readFileSync('src/app/globals.css', 'utf8');
const layout = fs.readFileSync('src/app/(dashboard)/layout.tsx', 'utf8');

console.log('=== GLOBALS.CSS LAST 200 CHARS ===');
console.log(css.slice(-200));

console.log('\n=== LAYOUT MAIN TAG ===');
const mainMatch = layout.split('\n').filter(l => l.includes('<main'));
console.log(mainMatch);

// Fix: remove ALL existing sidebar-offset rules and rewrite cleanly
let newCss = css
  .replace(/@media \(min-width: 1024px\) \{ \.sidebar-offset \{ margin-left: 240px; \} \}\n?/g, '')
  .replace(/@media \(min-width: 1024px\) \{\n\s*\.sidebar-offset \{ margin-left: 240px; \}\n\}\n?/g, '')
  .replace(/\n\s*\.sidebar-offset \{ margin-left: 240px; \}\n?/g, '');

newCss = newCss.trimEnd() + '\n\n@media (min-width: 1024px) {\n  .sidebar-offset {\n    margin-left: 240px;\n  }\n}\n';

fs.writeFileSync('src/app/globals.css', newCss, 'utf8');
console.log('\n=== NEW CSS LAST 150 CHARS ===');
console.log(newCss.slice(-150));
console.log('\nDone');
