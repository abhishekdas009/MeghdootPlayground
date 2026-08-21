with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

old_step4_failed = """                {/* Massive Watermark Step 4 */}
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

new_step5_failed = """                {/* Massive Watermark Step 5 */}
                <div className="absolute top-4 left-6 pointer-events-none select-none z-0 overflow-hidden">
                  <span className="whitespace-nowrap text-[70px] md:text-[80px] lg:text-[90px] leading-[0.85] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                    STEP 5
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

if old_step4_failed in page:
    page = page.replace(old_step4_failed, new_step5_failed)
    print("Replaced Failed Results to STEP 5 successfully")
else:
    print("Could not find old code!")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
