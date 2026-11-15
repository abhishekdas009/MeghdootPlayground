import os

filepath = 'frontend/app/soql-generator/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('function QueryPreviewCard')
idx = content.find('<CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">', start_idx)
end_idx = content.find('<div className="relative flex-1 min-h-0', idx)
snippet = content[idx:end_idx]

replacement = '''<CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
        {batches.length > 0 ? (
          <div className="rounded-2xl text-foreground flex flex-col min-h-0 flex-1 overflow-hidden relative bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 group/glass">
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-60 group-hover/glass:opacity-100 transition-opacity">
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
            </div>
            '''

if snippet in content:
    content = content.replace(snippet, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS replaced dynamically!")
else:
    print("FAIL")
