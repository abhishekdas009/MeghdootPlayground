const fs = require('fs');
let content = fs.readFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', 'utf8');

content = content.replace(/.*Key Insights<\/p>/g, '                        <p style={{ margin: "0 0 12px 0", fontWeight: "bold", fontSize: "15px" }}>?? Key Insights</p>');
content = content.replace(/.*Resolved .* Pending Closure.*/g, '                          <td style={{ padding: "8px", border: "1px solid #444" }}>Resolved - Pending Closure</td>');

fs.writeFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', content, 'utf8');
