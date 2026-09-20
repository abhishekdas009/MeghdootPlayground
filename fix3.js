const fs = require('fs');
let content = fs.readFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', 'utf8');

// Remove getInsights function
content = content.replace(/  function getInsights\(\) \{[\s\S]*?  \}/, '');

// Remove the insights rendering block
content = content.replace(/                    \{getInsights\(\)\.length > 0 && \([\s\S]*?                    \)\}/, '');

fs.writeFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', content, 'utf8');
