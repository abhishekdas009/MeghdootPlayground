import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the old code pattern from CardContent in QueryPreviewCard
pattern = r'<CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">\s*\{batches\.length > 0 \? \(\s*<div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden\s*dark:bg-black/20 dark:border dark:border-white/\[0\.05\]">\s*<div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-2\.5">.*?<div className="relative flex-1 min-h-0">'

replacement = '''<CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
          {batches.length > 0 ? (
            <div className="rounded-xl text-foreground flex flex-col min-h-0 flex-1 overflow-hidden relative
              bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl">
              <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
                <span className="text-[10px] font-mono font-black tracking-widest text-slate-400 uppercase bg-white/30 dark:bg-black/40 px-2 py-1 rounded-md backdrop-blur-md">
                  BATCH {batchIndex + 1} OF {batches.length}
                </span>
                <div className="flex items-center gap-1 bg-white/30 dark:bg-black/40 p-1 rounded-lg backdrop-blur-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-500 hover:text-indigo-600 hover:bg-white/50 dark:hover:bg-black/50 rounded-md transition-colors"
                    disabled={batchIndex <= 0}
                    onClick={() => setBatchIndex((value) => Math.max(0, value - 1))}
                    title="Previous Batch"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-500 hover:text-indigo-600 hover:bg-white/50 dark:hover:bg-black/50 rounded-md transition-colors"
                    disabled={batchIndex >= batches.length - 1}
                    onClick={() => setBatchIndex((value) => Math.min(batches.length - 1, value + 1))}
                    title="Next Batch"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="h-3 w-px bg-slate-400/50 mx-0.5" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-white/50 dark:hover:bg-black/50 rounded-md transition-colors gap-1.5"
                    onClick={() => onCopy(currentBatch)}
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                </div>
              </div>
              <div className="relative flex-1 min-h-0 mt-4">'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
