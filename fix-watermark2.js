const fs = require('fs');
const filepath = 'frontend/app/soql-generator/page.tsx';
let content = fs.readFileSync(filepath, 'utf-8');

function getWatermark(step) {
  return         <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
          <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
            STEP 
          </span>
        </div>;
}

// 1. Step 1 (Paste Cancellation Tickets / Paste Ticket Numbers / Upload Case IDs)
let pattern1 = /(<Card className="flex flex-col rounded-3xl border border-slate-200\/50 bg-white\/45 shadow-none backdrop-blur-xl dark:border-white\/10 dark:bg-slate-950\/45 overflow-hidden">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative">)/;
if (pattern1.test(content)) {
  content = content.replace(pattern1, $1\n\n);
  console.log("Updated step 1");
}

// 2. Step 2 (Cancellation SOQL Batches)
let pattern2 = /(<Card className="overflow-hidden rounded-3xl border border-slate-200\/50 bg-white\/45 shadow-none backdrop-blur-xl dark:border-white\/10 dark:bg-slate-950\/45 h-full flex flex-col transition-all duration-300 group relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">)\s*(<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">)\s*(<div className="flex gap-4 items-start">)\s*(<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500\/10 text-rose-600 dark:text-rose-400 shadow-inner mt-1">)/;
if (pattern2.test(content)) {
  content = content.replace(pattern2, $1\n\n\n\n\n);
  console.log("Updated step 2");
}

// 3. Step 3 (Paste SOQL Result Batch)
let pattern3 = /(<Card className="overflow-hidden rounded-3xl border border-slate-200\/50 bg-white\/45 shadow-none backdrop-blur-xl dark:border-white\/10 dark:bg-slate-950\/45 h-full flex flex-col transition-all duration-300 group relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">)\s*(<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">)\s*(<div className="flex items-center gap-4">)\s*(<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500\/10 text-emerald-600 dark:text-emerald-400 shadow-inner">)/;
if (pattern3.test(content)) {
  content = content.replace(pattern3, $1\n\n\n\n\n);
  console.log("Updated step 3");
}

// 4. Step 4 (Paste Failed Results)
let pattern4 = /(<Card className="overflow-hidden rounded-3xl border border-slate-200\/50 bg-white\/45 shadow-none backdrop-blur-xl dark:border-white\/10 dark:bg-slate-950\/45 h-full flex flex-col 2xl:col-span-1 transition-all duration-300 group relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">)\s*(<div className="flex items-center gap-4">)\s*(<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500\/10 text-amber-600 dark:text-amber-400 shadow-inner">)/;
if (pattern4.test(content)) {
  content = content.replace(pattern4, $1\n\n\n\n);
  console.log("Updated step 4");
}

fs.writeFileSync(filepath, content, 'utf-8');
