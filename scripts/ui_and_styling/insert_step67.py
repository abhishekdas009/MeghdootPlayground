with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

target = """                  <Textarea
                    placeholder={`Paste Account SOQL result here...
"_"	"Customer_ID__c"	"Id"`}
                    className="flex-1 min-h-[140px] font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-fuchsia-500/40 focus-visible:border-fuchsia-500 shadow-none p-4 resize-none"
                    value={accountSOQLResult}
                    onChange={(event) => setAccountSOQLResult(event.target.value)}
                  />
                </CardContent>
              </Card>"""

replacement = target + """

              {/* STEP 6 */}
              {transferOutput && (
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
                    <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                      STEP 6
                    </span>
                  </div>
                  <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                    <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-6 md:mt-8">
                      <div className="flex flex-col gap-1 w-full relative">
                        <div className="absolute top-0 right-0">
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(transferOutput)}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-[100px]">
                          Transfer<br />Result
                        </CardTitle>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Processed Transfer Data
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                    <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
                      <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 max-h-[320px] min-h-[140px] selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">
                        {transferOutput}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* STEP 7 */}
              {transferDebug && (
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
                    <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                      STEP 7
                    </span>
                  </div>
                  <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                    <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-6 md:mt-8">
                      <div className="flex flex-col gap-1 w-full relative">
                        <div className="absolute top-0 right-0">
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(transferDebug)}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-[100px]">
                          Transfer<br />Debug Info
                        </CardTitle>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Processing Logs
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                    <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
                      <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed text-slate-800 dark:text-amber-200 max-h-[320px] min-h-[140px] selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-100">
                        {transferDebug}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}"""

if target in page:
    page = page.replace(target, replacement)
    print("Inserted Step 6 and Step 7 successfully!")
else:
    print("Could not find the target string!")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
