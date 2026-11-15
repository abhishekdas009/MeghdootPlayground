import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'''<div className="rounded-2xl text-foreground flex flex-col min-h-0 flex-1 overflow-hidden relative bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-\[0_8px_30px_rgb\(0,0,0,0\.12\)\] dark:shadow-\[0_8px_30px_rgba\(0,0,0,0\.5\)\] transition-all duration-300 group/glass">\s*<div className="absolute top-3 right-3 z-20 flex items-center gap-1\.5 opacity-60 group-hover/glass:opacity-100 transition-opacity">\s*<div className="flex items-center gap-2 bg-white/30 dark:bg-black/40 px-2\.5 py-1\.5 rounded-lg backdrop-blur-md shadow-sm border border-white/20 dark:border-white/10">\s*<span className="text-\[9px\] font-mono font-black tracking-widest text-slate-600 dark:text-slate-300 uppercase">\s*BATCH \{childDetailsBatchIndex \+ 1\} / \{childDetailsSOQLBatches\.length\}\s*</span>\s*</div>\s*<div className="flex items-center gap-1 bg-white/30 dark:bg-black/40 p-1 rounded-lg backdrop-blur-md shadow-sm border border-white/20 dark:border-white/10">\s*<Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-white/10 rounded-md transition-colors" disabled=\{childDetailsBatchIndex <= 0\} onClick=\{\(\) => setChildDetailsBatchIndex\(\(value\) => Math\.max\(0, value - 1\)\)\}>\s*<ChevronLeft className="h-4 w-4" />\s*</Button>\s*<Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-white/10 rounded-md transition-colors" disabled=\{childDetailsBatchIndex >= childDetailsSOQLBatches\.length - 1\} onClick=\{\(\) => setChildDetailsBatchIndex\(\(value\) => Math\.min\(childDetailsSOQLBatches\.length - 1, value \+ 1\)\)\}>\s*<ChevronRight className="h-4 w-4" />\s*</Button>\s*<Button variant="ghost" size="sm" className="h-7 rounded-lg px-2 text-\[11px\] font-bold text-slate-500 hover:bg-blue-500/10 hover:text-blue-600" onClick=\{handleDownloadChildDetailsQuery\} disabled=\{childDetailsSOQLBatches\.length === 0\}>\s*<Download className="mr-1 h-3\.5 w-3\.5" /> SOQL\s*</Button>'''

replacement = '''<div className="overflow-hidden rounded-xl border border-slate-200/60 bg-slate-50/60 shadow-inner dark:border-slate-700/60 dark:bg-white/[0.03] dark:border-white/[0.05]">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 px-3 py-2 dark:border-slate-700/60">
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500">
                          <Terminal className="h-3.5 w-3.5 text-blue-500" />
                          Batch {childDetailsSOQLBatches.length ? childDetailsBatchIndex + 1 : 0}/{childDetailsSOQLBatches.length}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 rounded-lg p-0 text-slate-400 hover:bg-blue-500/10 hover:text-blue-600" disabled={childDetailsBatchIndex <= 0} onClick={() => setChildDetailsBatchIndex((value) => Math.max(0, value - 1))} title="Previous query batch">
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 rounded-lg p-0 text-slate-400 hover:bg-blue-500/10 hover:text-blue-600" disabled={childDetailsBatchIndex >= childDetailsSOQLBatches.length - 1} onClick={() => setChildDetailsBatchIndex((value) => Math.min(childDetailsSOQLBatches.length - 1, value + 1))} title="Next query batch">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 rounded-lg px-2 text-[11px] font-bold text-slate-500 hover:bg-blue-500/10 hover:text-blue-600" onClick={() => handleCopy(childDetailsCurrentSOQLBatch)} disabled={!childDetailsCurrentSOQLBatch}>
                            <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 rounded-lg px-2 text-[11px] font-bold text-slate-500 hover:bg-blue-500/10 hover:text-blue-600" onClick={handleDownloadChildDetailsQuery} disabled={childDetailsSOQLBatches.length === 0}>
                            <Download className="mr-1 h-3.5 w-3.5" /> SOQL
                          </Button>'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
