const fs = require('fs');

// Fix globals.css - add sidebar offset media query
let css = fs.readFileSync('src/app/globals.css', 'utf8');
if (!css.includes('sidebar-offset')) {
  css += '\n@media (min-width: 1024px) {\n  .sidebar-offset { margin-left: 240px; }\n}\n';
  fs.writeFileSync('src/app/globals.css', css, 'utf8');
  console.log('globals.css updated');
}

// Fix layout - use the CSS class
let layout = fs.readFileSync('src/app/(dashboard)/layout.tsx', 'utf8');
layout = layout.replace('className="lg:ml-60 min-h-screen"', 'className="sidebar-offset min-h-screen"');
fs.writeFileSync('src/app/(dashboard)/layout.tsx', layout, 'utf8');
console.log('layout.tsx updated');
console.log('Done');
