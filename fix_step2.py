with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

old_code = """              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4 items-start">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-inner mt-1">
                        <Terminal className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">Step 2</Badge>
                          <CardTitle className="text-base font-black tracking-tight text-foreground">Cancellation SOQL Batches</CardTitle>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Status not completed, 500 tickets per query
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm self-start">
                      {cancellationQueryBatches.length} batch{cancellationQueryBatches.length === 1 ? "" : "es"}
                    </Badge>
                  </div>
                </CardHeader>"""

new_code = """              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                
                {/* Massive Watermark Step 2 */}
                <div className="absolute top-4 left-6 pointer-events-none select-none z-0 overflow-hidden">
                  <span className="whitespace-nowrap text-[70px] md:text-[80px] lg:text-[90px] leading-[0.85] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                    STEP 2
                  </span>
                </div>

                <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                  <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-12 md:mt-14">
                    <div className="flex flex-col gap-1 w-full relative">
                      <div className="absolute top-0 right-0">
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                          {cancellationQueryBatches.length} batch{cancellationQueryBatches.length === 1 ? "" : "es"}
                        </Badge>
                      </div>
                      <CardTitle className="text-3xl md:text-4xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                        Cancellation<br />SOQL Batches
                      </CardTitle>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                        Status not completed, 500 tickets per query
                      </p>
                    </div>
                  </div>
                </CardHeader>"""

if old_code in page:
    page = page.replace(old_code, new_code)
    print("Replaced Step 2 successfully")
else:
    print("Could not find old code!")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
