with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

old_all_records = """                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">Final</Badge>
                          <CardTitle className="text-base font-black tracking-tight text-foreground">All Records</CardTitle>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Copy table when done
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(cancellationCanceledOutput)} disabled={uniqueExecutableCancellationRows.length === 0}>
                        <Copy className="h-3.5 w-3.5" /> Copy All
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={handleDownloadCancellationOutput} disabled={uniqueExecutableCancellationRows.length === 0}>
                        <Download className="h-3.5 w-3.5" /> TSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>"""

new_all_records = """                {/* Massive Watermark Step 4 */}
                <div className="absolute top-4 left-6 pointer-events-none select-none z-0 overflow-hidden">
                  <span className="whitespace-nowrap text-[70px] md:text-[80px] lg:text-[90px] leading-[0.85] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                    STEP 4
                  </span>
                </div>

                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-12 md:mt-14">
                    <div className="flex flex-col gap-1 w-full relative">
                      <div className="absolute top-0 right-0 flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(cancellationCanceledOutput)} disabled={uniqueExecutableCancellationRows.length === 0}>
                          <Copy className="h-3.5 w-3.5" /> Copy All
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={handleDownloadCancellationOutput} disabled={uniqueExecutableCancellationRows.length === 0}>
                          <Download className="h-3.5 w-3.5" /> TSV
                        </Button>
                      </div>
                      <CardTitle className="text-3xl md:text-4xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-[180px]">
                        All Records
                      </CardTitle>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                        Copy table when done
                      </p>
                    </div>
                  </div>
                </CardHeader>"""

if old_all_records in page:
    page = page.replace(old_all_records, new_all_records)
    print("Replaced All Records to STEP 4 successfully")
else:
    print("Could not find old code!")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
