import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

pattern = re.compile(r'\{isAssetTransfer && \(\s*<>\s*<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">.*?<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">.*?<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col xl:col-span-2 transition-all duration-300 group relative">.*?</CardContent>\s*</Card>\s*</>\s*\)', re.DOTALL)

replacement = """{isAssetTransfer && (
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
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(assetTransferComponentSOQL)} disabled={!assetTransferComponentSOQL}>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </Button>
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-[100px]">
                        Component<br />SOQL Query
                      </CardTitle>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Component Master Query
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                  <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
                    <pre className={`overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed max-h-[320px] min-h-[140px] selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-100 ${!assetTransferComponentSOQL ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-sky-200"}`}>
                      {assetTransferComponentSOQL || "Paste component pairs to generate Component SOQL"}
                    </pre>
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
                      <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white">
                        Asset SOQL<br />Result
                      </CardTitle>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Paste Asset SOQL Result
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col min-h-0 relative z-10">
                  <Textarea
                    placeholder={`Paste Asset SOQL result here...\n"_"\t"Component_Id__c"\t"Id"\t"Account.Customer_ID__c"\t"Record_Type__c"\t"Parent.Id"`}
                    className="flex-1 min-h-[140px] font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-fuchsia-500/40 focus-visible:border-fuchsia-500 shadow-none p-4 resize-none"
                    value={assetSOQLResult}
                    onChange={(event) => setAssetSOQLResult(event.target.value)}
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
                      <div className="absolute top-0 right-0">
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(assetTransferAccountSOQL)} disabled={!assetTransferAccountSOQL}>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </Button>
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-[100px]">
                        Account<br />SOQL Query
                      </CardTitle>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Account Master Query
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                  <div className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20">
                    <pre className={`overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-relaxed max-h-[320px] min-h-[140px] selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100 ${!assetTransferAccountSOQL ? "text-slate-400/60 dark:text-slate-500/50 font-medium" : "text-slate-800 dark:text-sky-200"}`}>
                      {assetTransferAccountSOQL || "Paste component pairs to generate Account SOQL"}
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
                        <Button className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold gap-2 h-8 px-4 rounded-lg text-[10px] shadow-md shadow-fuchsia-500/20 transition-all hover:-translate-y-0.5" onClick={handleProcessTransfer} disabled={!assetSOQLResult || !accountSOQLResult}>
                          <ArrowRightLeft className="h-3 w-3" /> Process
                        </Button>
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1] text-slate-800 dark:text-white pr-[120px]">
                        Account<br />SOQL Result
                      </CardTitle>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Paste Account SOQL Result
                        </p>
                        <Button variant="outline" size="sm" className="gap-2 h-7 px-3 rounded-lg text-[10px] font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" onClick={handleDownloadTransfer} disabled={!transferOutput}>
                          <Download className="h-3.5 w-3.5 text-slate-400" /> CSV
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col min-h-0 relative z-10">
                  <Textarea
                    placeholder={`Paste Account SOQL result here...\n"_"\t"Customer_ID__c"\t"Id"`}
                    className="flex-1 min-h-[140px] font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-fuchsia-500/40 focus-visible:border-fuchsia-500 shadow-none p-4 resize-none"
                    value={accountSOQLResult}
                    onChange={(event) => setAccountSOQLResult(event.target.value)}
                  />
                </CardContent>
              </Card>
            </>
          )"""

if pattern.search(page):
    page = pattern.sub(replacement, page, 1)
    print("Replaced isAssetTransfer right column cards successfully!")
else:
    print("Could not find isAssetTransfer right column cards")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
