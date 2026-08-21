with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

# Replace Step 2 (Assignment Mode)
old_step2 = """                <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-inner">
                        <CheckCircle2 className="h-4.5 w-4.5" />
                      </div>
                      <CardTitle className="text-sm font-black tracking-tight text-foreground flex-1">Assignment Mode &amp; Execution</CardTitle>
                    </div>
                    <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20 shadow-sm">Randomized</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">{caseAssignmentRows.length} valid IDs</Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">Open status</Badge>
                    <Badge variant={caseOwnerLoadState === "error" ? "danger" : "outline"} className={cn("text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm", caseOwnerLoadState === "error" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20")}>
                      {caseOwnerLoadState === "loading" ? "Roster syncing" : caseOwnerLoadState === "error" ? "Roster offline" : `${activeCaseOwners.length} active owners`}
                    </Badge>
                  </div>
                </CardHeader>"""

new_step2 = """                {/* Massive Watermark Step 2 */}
                <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
                  <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                    STEP 2
                  </span>
                </div>

                <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                  <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-6 md:mt-8">
                    <div className="flex flex-col gap-1 w-full relative">
                      <div className="absolute top-0 right-0">
                        <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20 shadow-sm">Randomized</span>
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-20">
                        Assignment Mode<br />&amp; Execution
                      </CardTitle>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">{caseAssignmentRows.length} valid IDs</Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">Open status</Badge>
                        <Badge variant={caseOwnerLoadState === "error" ? "danger" : "outline"} className={cn("text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm", caseOwnerLoadState === "error" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20")}>
                          {caseOwnerLoadState === "loading" ? "Roster syncing" : caseOwnerLoadState === "error" ? "Roster offline" : `${activeCaseOwners.length} active owners`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>"""

if old_step2 in page:
    page = page.replace(old_step2, new_step2)
    print("Replaced Case Assign Step 2")
else:
    print("Failed to replace Case Assign Step 2")

# Replace Step 3 (Final Assignment Output)
old_step3 = """                <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
                        <CheckCircle2 className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-black tracking-tight text-foreground">Final Assignment Output</CardTitle>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ready for Data Loader</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(caseAssignOutput)} disabled={!caseAssignOutput}>
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={handleDownloadCaseAssignment} disabled={!caseAssignOutput}>
                        <Download className="h-3.5 w-3.5" /> CSV
                      </Button>
                    </div>
                  </div>
                  {caseAssignmentResult && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">
                        {caseAssignmentResult.assignedCount} assigned
                      </Badge>
                      <Badge className={cn("text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm border", caseAssignmentResult.unassignedCaseIds.length ? "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700")}>
                        {caseAssignmentResult.unassignedCaseIds.length} unassigned
                      </Badge>
                    </div>
                  )}
                </CardHeader>"""

new_step3 = """                {/* Massive Watermark Step 3 */}
                <div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">
                  <span className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">
                    STEP 3
                  </span>
                </div>

                <CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10">
                  <div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2 mt-6 md:mt-8">
                    <div className="flex flex-col gap-1 w-full relative">
                      <div className="absolute top-0 right-0 flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(caseAssignOutput)} disabled={!caseAssignOutput}>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={handleDownloadCaseAssignment} disabled={!caseAssignOutput}>
                          <Download className="h-3.5 w-3.5" /> CSV
                        </Button>
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-[160px]">
                        Final Assignment<br />Output
                      </CardTitle>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">
                        Ready for Data Loader
                      </p>
                      {caseAssignmentResult && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm">
                            {caseAssignmentResult.assignedCount} assigned
                          </Badge>
                          <Badge className={cn("text-[10px] font-black uppercase px-2 py-0.5 tracking-widest shadow-sm border", caseAssignmentResult.unassignedCaseIds.length ? "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700")}>
                            {caseAssignmentResult.unassignedCaseIds.length} unassigned
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>"""

if old_step3 in page:
    page = page.replace(old_step3, new_step3)
    print("Replaced Case Assign Step 3")
else:
    print("Failed to replace Case Assign Step 3")

# Change Owner Master Roster to Owner Management
page = page.replace(
    'Owner Master Roster ({caseOwners.length})',
    'Owner Management ({caseOwners.length})'
)
page = page.replace(
    'Owner Master Roster ({activeCaseOwners.length})',
    'Owner Management ({activeCaseOwners.length})'
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
print("Finished!")
