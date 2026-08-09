const fs = require('fs');

const soqlPath = 'D:/MeghdootPlayground/frontend/app/soql-generator/page.tsx';
let soqlContent = fs.readFileSync(soqlPath, 'utf8');

soqlContent = soqlContent.replace(
  'className="grid gap-6 lg:grid-cols-12"',
  'className="grid gap-6 grid-cols-1 xl:grid-cols-12 lg:gap-8"'
);

soqlContent = soqlContent.replace(
  'className="2xl:col-span-3 xl:col-span-4 lg:col-span-5 md:col-span-12 space-y-4"',
  'className="2xl:col-span-3 xl:col-span-4 space-y-4 min-w-0"'
);

soqlContent = soqlContent.replace(
  'className="2xl:col-span-9 xl:col-span-8 lg:col-span-7 md:col-span-12 grid grid-cols-1 2xl:grid-cols-2 gap-6"',
  'className="2xl:col-span-9 xl:col-span-8 grid grid-cols-1 2xl:grid-cols-2 gap-6 min-w-0"'
);

soqlContent = soqlContent.replace(
  'className="grid grid-cols-[1fr_1fr_auto_auto] gap-2"',
  'className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto_auto] gap-2"'
);

soqlContent = soqlContent.replace(
  'className="flex w-full flex-wrap items-center gap-3 self-start 2xl:w-auto 2xl:self-center"',
  'className="flex w-full flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 self-start 2xl:w-auto 2xl:self-center"'
);

soqlContent = soqlContent.replace(
  'className="flex items-center gap-1 bg-slate-50/50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner"',
  'className="flex flex-wrap sm:flex-nowrap items-center gap-1 bg-slate-50/50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner shrink-0"'
);

let count = 0;
soqlContent = soqlContent.replace(/className="grid grid-cols-4 gap-2"/g, () => {
  count++;
  return 'className="grid grid-cols-2 sm:grid-cols-4 gap-2"';
});

soqlContent = soqlContent.replace(
  'className="grid grid-cols-3 gap-2"',
  'className="grid grid-cols-1 sm:grid-cols-3 gap-2"'
);

fs.writeFileSync(soqlPath, soqlContent);
console.log('Fixed soql-generator, modified ' + count + ' 4-col grids');
