const fs = require('fs');
let content = fs.readFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', 'utf8');

// Replace KPI / Status
content = content.replace(/>KPI \/ Status</g, '>Ticket Status<');

// Remove dash from headers (but wait, what exactly did they ask?)
// "Daily Support Ticket Summary – 20-Sept-2026 why it should be Daily Support Ticket Summary 20-Sept-2026"
// Let's replace any dash or weird char after Summary and before Date
content = content.replace(/Daily Support Ticket Summary [–-]* /g, 'Daily Support Ticket Summary ');
content = content.replace(/Daily Case Report [–-]* /g, 'Daily Case Report ');

// Also in the handleDraftEmail subject, it might have a dash: `Daily Support Ticket Summary - ${reportDate}`
content = content.replace(/Daily Support Ticket Summary - \$\{reportDate\}/g, 'Daily Support Ticket Summary ${reportDate}');


fs.writeFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', content, 'utf8');
