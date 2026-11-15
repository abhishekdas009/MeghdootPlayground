import sys
import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the CardHeader block
old_header = '''          <div className="flex items-center gap-3">
            <span className="font-black uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400">
              {batches.length} batch{batches.length === 1 ? "" : "es"}
            </span>
            <MagneticButton
              className="h-8 px-3 gap-2 text-xs font-bold bg-indigo-500/10 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg shadow-sm"
              onClick={() => onCopy(batches.join("\\n\\n"))}
              glowColor="rgba(99, 102, 241, 0.15)"
            >
              <Copy className="h-3.5 w-3.5" /> Copy All
            </MagneticButton>
          </div>'''

new_header = '''          <div className="flex flex-wrap items-center gap-3">
            <span className="font-black uppercase tracking-widest text-[10px] text-slate-500 dark:text-slate-400">
              {batches.length} batch{batches.length === 1 ? "" : "es"}
            </span>
            
            {batches.length > 1 && (
              <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-white/[0.05] rounded-lg p-0.5 shadow-sm border border-slate-200 dark:border-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-md"
                  disabled={batchIndex <= 0}
                  onClick={() => setBatchIndex((value) => Math.max(0, value - 1))}
                  title="Previous Batch"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-[10px] font-mono font-black px-2 text-slate-600 dark:text-slate-300">
                  {batchIndex + 1} / {batches.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 rounded-md"
                  disabled={batchIndex >= batches.length - 1}
                  onClick={() => setBatchIndex((value) => Math.min(batches.length - 1, value + 1))}
                  title="Next Batch"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 gap-1.5 text-xs font-bold border-slate-200 dark:border-slate-700 shadow-sm"
                onClick={() => onCopy(currentBatch)}
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>

              {batches.length > 1 && (
                <MagneticButton
                  className="h-8 px-3 gap-2 text-xs font-bold bg-indigo-500/10 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg shadow-sm"
                  onClick={() => onCopy(batches.join("\\n\\n"))}
                  glowColor="rgba(99, 102, 241, 0.15)"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy All
                </MagneticButton>
              )}
            </div>
          </div>'''

content = content.replace(old_header, new_header)

# Now remove the absolute floating buttons
old_floating = '''            <div className="absolute top-3 right-4 z-20 flex items-center gap-2 opacity-60 group-hover/glass:opacity-100 transition-opacity duration-300">
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

content = content.replace(old_floating, "")

# Ensure the pre wrapper has no extra top margin now
content = content.replace('<div className="relative flex-1 min-h-0 mt-4">', '<div className="relative flex-1 min-h-0">')

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
