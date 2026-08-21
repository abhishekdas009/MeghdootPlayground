with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

old_step3 = """                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">Step 3</Badge>
                          <CardTitle className="text-base font-black tracking-tight text-foreground">Paste SOQL Result Batch</CardTitle>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Each paste is stored and converted to Canceled
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm self-start">
                      {cancellationResultBatchCount} stored batch{cancellationResultBatchCount === 1 ? "" : "es"}
                    </Badge>
                  </div>
                </CardHeader>"""

new_step3 = """                {/* Massive Watermark Step 3 */}
                <div className="absolute top-4 left-6 pointer-events-none select-none z-0 overflow-hidden">
                  <span className="whitespace-nowrap text-[70px] md:text-[80px] lg:text-[90px] leading-[0.85] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                    STEP 3
                  </span>
                </div>

                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-12 md:mt-14">
                    <div className="flex flex-col gap-1 w-full relative">
                      <div className="absolute top-0 right-0">
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                          {cancellationResultBatchCount} stored batch{cancellationResultBatchCount === 1 ? "" : "es"}
                        </Badge>
                      </div>
                      <CardTitle className="text-3xl md:text-4xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                        Paste SOQL<br />Result Batch
                      </CardTitle>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                        Each paste is stored and converted to Canceled
                      </p>
                    </div>
                  </div>
                </CardHeader>"""

old_step4 = """                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-inner">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">Step 4 (Optional)</Badge>
                        <CardTitle className="text-base font-black tracking-tight text-foreground">Paste Failed Results</CardTitle>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Paste failed tickets to generate stats
                      </p>
                    </div>
                  </div>
                </CardHeader>"""

new_step4 = """                {/* Massive Watermark Step 4 */}
                <div className="absolute top-4 left-6 pointer-events-none select-none z-0 overflow-hidden">
                  <span className="whitespace-nowrap text-[70px] md:text-[80px] lg:text-[90px] leading-[0.85] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                    STEP 4
                  </span>
                </div>

                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-12 md:mt-14">
                    <div className="flex flex-col gap-1 w-full relative">
                      <div className="absolute top-0 right-0">
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                          OPTIONAL
                        </Badge>
                      </div>
                      <CardTitle className="text-3xl md:text-4xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                        Paste Failed<br />Results
                      </CardTitle>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                        Paste failed tickets to generate stats
                      </p>
                    </div>
                  </div>
                </CardHeader>"""

count = 0
if old_step3 in page:
    page = page.replace(old_step3, new_step3)
    print("Replaced Step 3 successfully")
    count += 1
if old_step4 in page:
    page = page.replace(old_step4, new_step4)
    print("Replaced Step 4 successfully")
    count += 1

if count > 0:
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(page)
else:
    print("Could not find old code!")
