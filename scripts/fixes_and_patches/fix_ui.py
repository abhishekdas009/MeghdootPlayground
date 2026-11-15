import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-60 group-hover/glass:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 bg-white/30 dark:bg-black/40 px-2.5 py-1.5 rounded-lg backdrop-blur-md shadow-sm border border-white/20 dark:border-white/10">
                <span className="text-[9px] font-mono font-black tracking-widest text-slate-600 dark:text-slate-300 uppercase">
                  BATCH {batchIndex + 1} / {batches.length}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white/30 dark:bg-black/40 p-1 rounded-lg backdrop-blur-md shadow-sm border border-white/20 dark:border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-white/10 rounded-md transition-colors"
                  disabled={batchIndex <= 0}
                  onClick={() => setBatchIndex((value) => Math.max(0, value - 1))}
                  title="Previous Batch"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-white/10 rounded-md transition-colors"
                  disabled={batchIndex >= batches.length - 1}
                  onClick={() => setBatchIndex((value) => Math.min(batches.length - 1, value + 1))}
                  title="Next Batch"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="h-3 w-px bg-slate-400/30 mx-0.5" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-white/10 rounded-md transition-colors gap-1.5"
                  onClick={() => onCopy(currentBatch)}
                >
                  <Copy className="h-3 w-3" /> Copy
                </Button>
              </div>
            </div>'''

replacement = '''            <div className="absolute top-3 right-4 z-20 flex items-center gap-2 opacity-60 group-hover/glass:opacity-100 transition-opacity duration-300">
              <div className="flex items-center justify-center bg-slate-900/90 dark:bg-[#0a0f1c]/90 backdrop-blur-md shadow-md border border-slate-700/50 dark:border-white/5 rounded-2xl px-3.5 py-2">
                <span className="text-[10px] font-mono font-black tracking-widest text-slate-300 dark:text-slate-400 uppercase">
                  BATCH {batchIndex + 1} / {batches.length}
                </span>
              </div>
              <div className="flex items-center gap-0.5 bg-slate-900/90 dark:bg-[#0a0f1c]/90 backdrop-blur-md shadow-md border border-slate-700/50 dark:border-white/5 rounded-2xl p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-white hover:bg-slate-700/50 dark:hover:bg-white/10 rounded-xl transition-all"
                  disabled={batchIndex <= 0}
                  onClick={() => setBatchIndex((value) => Math.max(0, value - 1))}
                  title="Previous Batch"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-white hover:bg-slate-700/50 dark:hover:bg-white/10 rounded-xl transition-all"
                  disabled={batchIndex >= batches.length - 1}
                  onClick={() => setBatchIndex((value) => Math.min(batches.length - 1, value + 1))}
                  title="Next Batch"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="h-3.5 w-px bg-slate-600/50 mx-1.5" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2.5 text-[11px] font-black tracking-wide text-slate-300 dark:text-slate-400 hover:text-white dark:hover:text-white hover:bg-slate-700/50 dark:hover:bg-white/10 rounded-xl transition-all gap-1.5"
                  onClick={() => onCopy(currentBatch)}
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </Button>
              </div>
            </div>'''

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success")
else:
    print("Target not found. Let's do a more robust replacement.")
