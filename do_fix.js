const fs = require('fs');
const code = fs.readFileSync('frontend/app/soql-generator/page.tsx', 'utf8');

const startMarker = '{isCaseAssign && (';
const endMarker = '{/* Round Robin UI Cards (Only shown after generation) */}';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

const target = code.substring(startIndex, endIndex);

// We can just read fix_layout.js, finding the first "{isCaseAssign"
const fixLayoutCode = fs.readFileSync('fix_layout.js', 'utf8');
const fixStart = fixLayoutCode.indexOf('{isCaseAssign && (');
const fixEnd = fixLayoutCode.lastIndexOf(')}');
// Add the ); that we missed
const replacement = fixLayoutCode.substring(fixStart, fixEnd + 2) + "\n              ";

const newCode = code.replace(target, replacement);

fs.writeFileSync('frontend/app/soql-generator/page.tsx', newCode, 'utf8');
console.log('Fixed page.tsx using do_fix.js!');
