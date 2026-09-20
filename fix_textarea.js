const fs = require('fs');
let content = fs.readFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', 'utf8');

const oldClasses = "min-h-[140px] resize-y bg-black/40 border-slate-700/50 font-mono text-[11px] text-slate-300 placeholder:text-slate-600 focus-visible:ring-indigo-500/30 rounded-xl leading-relaxed";
const newClasses = "min-h-[140px] resize-y bg-white dark:bg-black/40 border-slate-200 dark:border-slate-700/50 font-mono text-[11px] text-slate-900 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-indigo-500/30 rounded-xl leading-relaxed shadow-inner shadow-slate-100 dark:shadow-none";

content = content.replace(new RegExp(oldClasses.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newClasses);

fs.writeFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', content, 'utf8');
