const fs = require('fs');
let content = fs.readFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', 'utf8');

// Remove all inline color declarations
content = content.replace(/, color: "\#1e293b"/g, '');
content = content.replace(/, color: "\#0f172a"/g, '');
// Links should stay blue, so leave color: "#0563C1" alone.

// But wait, the wrapper div had:
// className="p-6 md:p-8 overflow-y-auto max-h-[800px] text-[15px] font-sans text-slate-800 dark:text-slate-300 select-text"
// Let's just make sure the wrapper handles it.

fs.writeFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', content, 'utf8');
