const fs = require('fs');
let code = fs.readFileSync('page_original.tsx', 'utf8');
let start = code.indexOf('{isCaseAssign && (');
start = code.indexOf('{isCaseAssign && (', start + 1);
const end = code.indexOf('{/* Round Robin UI Cards (Only shown after generation) */}', start);
let layout = code.substring(start, end);

layout = layout.replace(
  '<div className="col-span-1 2xl:col-span-2 xl:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">',
  '<div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 items-start w-full">'
);

layout = layout.replace(
  '{/* === LEFT WORKBENCH COLUMN === */}',
  '{/* === COLUMN 1: WORKBENCH === */}'
);

layout = layout.replace(
  '{/* === RIGHT RESULTS COLUMN === */}',
  '{/* === COLUMN 2: RESULTS === */}'
);

layout = layout.replace(
  '{/* Compact High-Density Owner Master Management */}',
  '</div>\n                {/* === COLUMN 3: MASTER ROSTER === */}\n                <div className="space-y-4 flex flex-col">\n                  {/* Compact High-Density Owner Master Management */}'
);

let pageCode = fs.readFileSync('frontend/app/soql-generator/page.tsx', 'utf8');

let targetStart = pageCode.indexOf('{isCaseAssign && (\''); // Find corrupted part
if (targetStart === -1) {
  targetStart = pageCode.indexOf('{isCaseAssign && (');
  targetStart = pageCode.indexOf('{isCaseAssign && (', targetStart + 1);
}
const targetEnd = pageCode.indexOf('{/* Round Robin UI Cards (Only shown after generation) */}', targetStart);

if (targetStart !== -1 && targetEnd !== -1) {
  pageCode = pageCode.substring(0, targetStart) + layout + pageCode.substring(targetEnd);
  fs.writeFileSync('frontend/app/soql-generator/page.tsx', pageCode, 'utf8');
  console.log('Fixed completely!');
} else {
  console.log('Failed to find bounds', targetStart, targetEnd);
}
