const fs = require('fs');

const excelPath = 'D:/MeghdootPlayground/frontend/app/excel-automation/page.tsx';
let excelContent = fs.readFileSync(excelPath, 'utf8');

excelContent = excelContent.replace(
  '<div className="grid gap-6 lg:grid-cols-12 lg:gap-8">',
  '<div className="grid gap-6 grid-cols-1 xl:grid-cols-12 lg:gap-8">'
);

excelContent = excelContent.replace(
  '<div className="flex flex-col gap-6 lg:col-span-5 xl:col-span-4">',
  '<div className="flex flex-col gap-6 xl:col-span-4 min-w-0">'
);

excelContent = excelContent.replace(
  '<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">',
  '<div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-1">'
);

excelContent = excelContent.replace(
  'className="lg:col-span-7 xl:col-span-8 flex flex-col"',
  'className="xl:col-span-8 flex flex-col min-w-0"'
);

excelContent = excelContent.replace(
  'min-h-[600px]',
  'min-h-[400px] xl:min-h-[600px]'
);

excelContent = excelContent.replace(
  '<div className="flex flex-wrap items-center gap-3">',
  '<div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">'
);

excelContent = excelContent.replace(
  '"h-11 min-w-[130px] gap-2',
  '"h-11 flex-1 sm:flex-none sm:min-w-[130px] gap-2'
);

excelContent = excelContent.replace(
  '<><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>',
  '<><Loader2 className="h-4 w-4 animate-spin shrink-0" /> Processing...</>'
);

excelContent = excelContent.replace(
  '<><Sparkles className="h-4 w-4" /> Process Data</>',
  '<><Sparkles className="h-4 w-4 shrink-0" /> Process Data</>'
);

excelContent = excelContent.replace(
  '"h-11 rounded-xl gap-2',
  '"h-11 flex-1 sm:flex-none rounded-xl gap-2'
);

excelContent = excelContent.replace(
  '<Download className="h-4 w-4" /> Export',
  '<Download className="h-4 w-4 shrink-0" /> Export'
);

fs.writeFileSync(excelPath, excelContent);
console.log('Fixed excel');


const dashPath = 'D:/MeghdootPlayground/frontend/app/dashboard/page.tsx';
let dashContent = fs.readFileSync(dashPath, 'utf8');

const oldKpi = `      <div className="relative h-full min-h-[11rem] flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-900/10 bg-card/55 p-[clamp(1rem,2vw,1.5rem)] shadow-none backdrop-blur-xl dark:border-white/10">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Icon className="w-24 h-24 -mr-6 -mt-6 transform rotate-12" />
        </div>
        <div className="relative flex items-start justify-between gap-4 z-10">
          <div className="min-w-0 flex-1">
            <p className="text-[clamp(0.8125rem,1.2vw,0.95rem)] font-semibold tracking-wide text-foreground break-words">{label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-[clamp(2rem,5vw,2.75rem)] font-black tabular-nums text-foreground tracking-tight drop-shadow-sm">
                {displayValue.toLocaleString()}
              </p>
            </div>
            {value > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold leading-tight text-emerald-800 dark:text-emerald-200"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Active Today
              </motion.div>
            )}
          </div>
          <div
            className={cn(
              "flex h-[var(--icon-box-md)] w-[var(--icon-box-md)] shrink-0 items-center justify-center rounded-2xl shadow-lg ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3",
              iconBg, iconText
            )}
          >
            <Icon className="h-[var(--icon-size-md)] w-[var(--icon-size-md)]" />
          </div>
        </div>
      </div>`;

const newKpi = `      <div className="relative h-full min-h-[11rem] flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-900/10 bg-card/55 p-[clamp(1rem,2vw,1.5rem)] shadow-none backdrop-blur-xl dark:border-white/10">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Icon className="w-24 h-24 -mr-6 -mt-6 transform rotate-12" />
        </div>
        <div className="relative flex flex-col justify-between h-full z-10 gap-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[clamp(0.875rem,1.5vw,1rem)] font-semibold tracking-wide text-foreground break-words flex-1 min-w-0">
              {label}
            </p>
            <div
              className={cn(
                "flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3",
                iconBg, iconText
              )}
            >
              <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
          </div>
          <div className="flex flex-col items-start gap-2">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-black tabular-nums text-foreground tracking-tight drop-shadow-sm line-clamp-1">
              {displayValue.toLocaleString()}
            </p>
            {value > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold leading-tight text-emerald-800 dark:text-emerald-200"
              >
                <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Active Today</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>`;

dashContent = dashContent.replace(oldKpi, newKpi);
fs.writeFileSync(dashPath, dashContent);
console.log('Fixed dash');
