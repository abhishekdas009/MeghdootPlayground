with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

bad_snippet = """                      )}
                    </div>
                  </div>
                </CardHeader>

                  <CardContent className="p-5 space-y-4 relative z-10 flex-1 flex flex-col min-h-0">
                    {/* Compact Add/Update Bar */}"""

good_snippet = """                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 relative z-10 flex-1 flex flex-col min-h-0">
                  <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
                    <Textarea
                      readOnly
                      value={caseAssignOutput}
                      placeholder="Click Generate to assign owners..."
                      className={`flex-1 min-h-[140px] w-full resize-none border-0 bg-transparent p-5 font-mono text-xs focus-visible:ring-0 ${!caseAssignOutput ? "text-slate-400/60 font-medium dark:text-slate-500/50" : "text-slate-800 dark:text-sky-200"}`}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* === COLUMN 3: ROSTER === */}
            <div className="space-y-4 flex flex-col h-full min-h-0">
              {/* Owner Roster Box */}
              <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col flex-1 min-h-0 transition-all duration-300 relative group">
                <CardHeader className="pb-4 bg-transparent p-5 relative z-10">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">
                        <Users className="h-4.5 w-4.5" />
                      </div>
                      <CardTitle className="text-sm font-black tracking-tight text-foreground flex-1">Owner Management ({caseOwners.length})</CardTitle>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 bg-slate-50/50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner shrink-0">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 gap-0 font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors" onClick={refreshCaseOwners} disabled={caseOwnerAction !== null} title="Refresh DB">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 gap-0 font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors" onClick={handleExportOwners} title="Export JSON">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <label className="inline-flex cursor-pointer group">
                        <input type="file" accept="application/json" className="hidden" onChange={handleImportOwners} disabled={caseOwnerAction !== null} />
                        <span className="flex items-center justify-center h-7 w-7 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-500/10 rounded-lg transition-colors" title="Import JSON">
                          <Upload className="h-3.5 w-3.5" />
                        </span>
                      </label>
                      <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 gap-0 font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" onClick={handleResetOwners} disabled={caseOwnerAction !== null} title="Reset default roster">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4 relative z-10 flex-1 flex flex-col min-h-0">
                  {/* Compact Add/Update Bar */}"""

if bad_snippet in page:
    page = page.replace(bad_snippet, good_snippet)
    print("Fixed corrupted code successfully!")
else:
    print("Could not find corrupted code")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
