const fs = require('fs');
let content = fs.readFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', 'utf8');

// The leftover block is between `};` of handleDraftEmail and `const handleCopyEmail = () => {`
// Let's replace the whole leftover chunk.
content = content.replace(/ else \{\n      insights\.push\(`Closure rate[\s\S]*?return insights;\n  \}/, '');

fs.writeFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', content, 'utf8');
