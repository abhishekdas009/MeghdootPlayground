import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old_summary = '''<div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                          <div className="flex justify-between"><span className="text-slate-500 font-medium">File</span><span className="font-bold truncate max-w-[120px]" title={uploadSummary.file}>{uploadSummary.file}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 font-medium">Records Scanned</span><span className="font-bold">{uploadSummary.scannedLines.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 font-medium">Case IDs Detected</span><span className="font-bold">{uploadSummary.total.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500 font-medium">Unique Case IDs</span><span className="font-bold">{uploadSummary.unique.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-emerald-600 dark:text-emerald-400 font-bold">Valid Cases</span><span className="font-bold text-emerald-600 dark:text-emerald-400">{uploadSummary.valid.toLocaleString()}</span></div>
                          <div className="flex justify-between"><span className="text-rose-500 font-bold">Not Found</span><span className="font-bold text-rose-500">{uploadSummary.missing.toLocaleString()}</span></div>
                        </div>'''

new_summary = '''<div className="grid grid-cols-2 gap-3 text-xs bg-white/40 dark:bg-black/20 rounded-xl p-3 border border-emerald-100/50 dark:border-emerald-800/30">
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500/80 dark:text-slate-400/80">File Name</span>
                            <span className="font-black text-slate-700 dark:text-slate-300 truncate" title={uploadSummary.file}>{uploadSummary.file}</span>
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500/80 dark:text-slate-400/80">Records Scanned</span>
                            <span className="font-black text-slate-700 dark:text-slate-300">{uploadSummary.scannedLines.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500/80 dark:text-slate-400/80">IDs Detected</span>
                            <span className="font-black text-slate-700 dark:text-slate-300">{uploadSummary.total.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500/80 dark:text-slate-400/80">Unique IDs</span>
                            <span className="font-black text-slate-700 dark:text-slate-300">{uploadSummary.unique.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Valid Cases</span>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">{uploadSummary.valid.toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 dark:text-rose-400">Not Found</span>
                            <span className="font-black text-rose-500 dark:text-rose-400 text-sm">{uploadSummary.missing.toLocaleString()}</span>
                          </div>
                        </div>'''

text = text.replace(old_summary, new_summary)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Upload summary replaced successfully!')
