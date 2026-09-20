const fs = require('fs');
let content = fs.readFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', 'utf8');

const newHeader = `
      {/* ?? Header Section ?? */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="page-hero relative flex flex-col gap-6 overflow-hidden rounded-3xl p-8"
      >
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none dark:bg-purple-500/20 dark:mix-blend-screen" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none dark:bg-blue-500/20 dark:mix-blend-screen" />
        
        <div className="relative z-10 flex flex-col gap-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/30 border border-white/10">
              <Mail className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="sm:text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm uppercase tracking-widest text-[10px] font-black text-slate-500 dark:text-slate-400">
                  EMAIL OPERATIONS
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 drop-shadow-sm dark:text-white">
                Daily Report <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Generator</span>
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-2 max-w-xl">
                Paste your completed and pending tickets below, or upload the files directly, to instantly generate a perfectly formatted end-of-day summary email and merged Excel file.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
`;

content = content.replace(/      \{\/\* Header \*\/\}[\s\S]*?<\/section>/, newHeader.trim());

fs.writeFileSync('e:/MeghdootPlayground/frontend/app/daily-report-generator/page.tsx', content, 'utf8');
