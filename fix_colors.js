const fs = require('fs');
let content = fs.readFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', 'utf8');

content = content.replace(/text-\[\#d4d4d4\]/g, 'text-slate-800 dark:text-slate-300');
content = content.replace(/color: "\#d4d4d4"/g, 'color: "#1e293b"');
content = content.replace(/1px solid \#444/g, '1px solid #cbd5e1');
content = content.replace(/borderBottom: "1px solid #444", color: "#ffffff"/g, 'borderBottom: "2px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#0f172a"');
content = content.replace(/color: "#ffffff"/g, 'color: "#0f172a"'); // fallback

fs.writeFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', content, 'utf8');
