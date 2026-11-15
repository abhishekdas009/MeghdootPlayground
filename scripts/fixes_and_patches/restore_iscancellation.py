import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

pattern = re.compile(r'(\s*\{cancellationUpdateDebug && \(\s*<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col xl:col-span-2 transition-all duration-300 group relative">)')

replacement = """          {isCancellation && (() => {
            return (
              <>
                {/* STEP 2 */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
                    <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                      STEP 2
                    </span>
                  </div>
                  <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                    <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-6 md:mt-8">
                      <div className="flex flex-col gap-1 w-full relative">
                        <div className="absolute top-0 right-0">
                          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                            {cancellationQueryBatches.length} batch{cancellationQueryBatches.length === 1 ? "" : "es"}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                          Cancellation<br />SOQL Batches
                        </CardTitle>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Status not completed, 500 tickets per query
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                    <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
                      <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed max-h-[320px] min-h-[140px] selection:bg-rose-500/20 selection:text-rose-900 dark:selection:text-rose-100 text-slate-800 dark:text-sky-200">
                        {cancellationQueryBatches[cancellationExecutionBatchIndex]}
                      </pre>
                    </div>
                    {cancellationQueryBatches.length > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setCancellationExecutionBatchIndex(i => Math.max(0, i - 1))} disabled={cancellationExecutionBatchIndex === 0}>Prev</Button>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Batch {cancellationExecutionBatchIndex + 1} of {cancellationQueryBatches.length}</span>
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setCancellationExecutionBatchIndex(i => Math.min(cancellationQueryBatches.length - 1, i + 1))} disabled={cancellationExecutionBatchIndex === cancellationQueryBatches.length - 1}>Next</Button>
                      </div>
                    )}
                    <div className="flex justify-end mt-4">
                       <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(cancellationQueryBatches[cancellationExecutionBatchIndex])} disabled={!cancellationQueryBatches.length}>
                          <Copy className="h-3.5 w-3.5" /> Copy Query
                       </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* STEP 3 */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
                    <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                      STEP 3
                    </span>
                  </div>
                  <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                    <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-6 md:mt-8">
                      <div className="flex flex-col gap-1 w-full relative">
                        <div className="absolute top-0 right-0">
                          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                            {cancellationResultBatchCount} stored batch{cancellationResultBatchCount === 1 ? "" : "es"}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                          Paste SOQL<br />Result Batch
                        </CardTitle>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Each paste is stored and converted to Canceled
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col min-h-0 relative z-10">
                    <Textarea
                      placeholder={`Paste batch SOQL result here...\\n"_"  "Ticket_Number_Read_Only__c"  "Status"\\n...`}
                      className="flex-1 min-h-[140px] font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500 shadow-none p-4 resize-none"
                      value={cancellationExecutionInput}
                      onChange={(e) => handleCancellationResultInputChange(e.target.value)}
                      onPaste={handleCancellationResultPaste}
                    />
                  </CardContent>
                </Card>

                {/* STEP 4 */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
                    <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                      STEP 4
                    </span>
                  </div>
                  <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                    <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-6 md:mt-8">
                      <div className="flex flex-col gap-1 w-full relative">
                        <div className="absolute top-0 right-0 flex gap-2">
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(cancellationCanceledOutput)} disabled={uniqueExecutableCancellationRows.length === 0}>
                            <Copy className="h-3.5 w-3.5" /> Copy All
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={handleDownloadCancellationOutput} disabled={uniqueExecutableCancellationRows.length === 0}>
                            <Download className="h-3.5 w-3.5" /> TSV
                          </Button>
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-[180px]">
                          All Records
                        </CardTitle>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Copy table when done
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                    <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
                      <pre className="overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed max-h-[320px] min-h-[140px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 text-slate-800 dark:text-sky-200">
                        {cancellationCanceledOutput || "No parsed batch data yet. Paste batch results above."}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {/* STEP 5 */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                  <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
                    <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                      STEP 5
                    </span>
                  </div>
                  <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                    <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-6 md:mt-8">
                      <div className="flex flex-col gap-1 w-full relative">
                        <div className="absolute top-0 right-0">
                          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase px-2.5 py-1 tracking-widest shadow-sm">
                            OPTIONAL
                          </Badge>
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                          Paste Failed<br />Results
                        </CardTitle>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          Paste failed tickets to generate stats
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col min-h-0 relative z-10">
                    <Textarea
                      placeholder={`Paste failed tickets here...\\n"TKT-123"\\n"TKT-456"\\n...`}
                      className="flex-1 min-h-[140px] font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-amber-500/40 focus-visible:border-amber-500 shadow-none p-4 resize-none"
                      value={cancellationFailedInput}
                      onChange={(e) => setCancellationFailedInput(e.target.value)}
                    />
                  </CardContent>
                </Card>
              </>
            );
          })()}
\\1"""

if pattern.search(page):
    page = pattern.sub(replacement, page)
    print("Restored isCancellation right column!")
else:
    print("Could not find cancellationUpdateDebug block")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
