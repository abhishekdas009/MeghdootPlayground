import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = r'''<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col xl:col-span-2 transition-all duration-300 group relative">
                  <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 shadow-inner">
                        <ArrowRightLeft className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-black tracking-tight text-foreground">SOQL Results Processing</CardTitle>
                        <p className="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Paste results from both SOQL queries to generate transfer file
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col">
                        <label className="text-\[11px\] font-black text-slate-500 mb-2 uppercase tracking-widest pl-1">Asset SOQL Result</label>
                        <Textarea
                          placeholder=\{Paste Asset SOQL result here...\\n"_"   "Component_Id__c"   "Id"   "Account\.Customer_ID__c"   "Record_Type__c"   "Parent\.Id"\}
                          className="flex-1 min-h-\[160px\] font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y"
                          value=\{assetSOQLResult\}
                          onChange=\{\(event\) => setAssetSOQLResult\(event\.target\.value\)\}
                        />
                      </div>
  
                      <div className="flex flex-col">
                        <label className="text-\[11px\] font-black text-slate-500 mb-2 uppercase tracking-widest pl-1">Account SOQL Result</label>
                        <Textarea
                          placeholder=\{Paste Account SOQL result here...\\n"_"   "Customer_ID__c"   "Id"\}
                          className="flex-1 min-h-\[160px\] font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y"
                          value=\{accountSOQLResult\}
                          onChange=\{\(event\) => setAccountSOQLResult\(event\.target\.value\)\}
                        />
                      </div>
                    </div>
  
                    <div className="flex items-center gap-3 pt-2">
                      <Button className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold gap-2 h-10 px-5 rounded-xl text-xs shadow-md shadow-fuchsia-500/20 transition-all hover:-translate-y-0.5" onClick=\{handleProcessTransfer\} disabled=\{!assetSOQLResult \|\| !accountSOQLResult\}>
                        <ArrowRightLeft className="h-4 w-4" /> Process Transfer
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 h-10 px-4 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" onClick=\{handleDownloadTransfer\} disabled=\{!transferOutput\}>
                        <Download className="h-4 w-4 text-slate-400" /> Download CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>'''

replacement = r'''<div className="grid grid-cols-1 md:grid-cols-2 gap-5 xl:col-span-2">
                  <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                    <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                      <div className="flex items-center gap-3">
                        <CardTitle className="mt-4 md:mt-5 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Asset SOQL Result</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                        <Textarea
                          placeholder={Paste Asset SOQL result here...\n"_"   "Component_Id__c"   "Id"   "Account.Customer_ID__c"   "Record_Type__c"   "Parent.Id"}
                          className="flex-1 min-h-[160px] font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y"
                          value={assetSOQLResult}
                          onChange={(event) => setAssetSOQLResult(event.target.value)}
                        />
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                    <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                      <div className="flex items-center gap-3">
                        <CardTitle className="mt-4 md:mt-5 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Account SOQL Result</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                        <Textarea
                          placeholder={Paste Account SOQL result here...\n"_"   "Customer_ID__c"   "Id"}
                          className="flex-1 min-h-[160px] font-mono text-xs leading-relaxed rounded-xl border-transparent bg-transparent focus-visible:ring-0 focus-visible:border-transparent shadow-none p-4 resize-y"
                          value={accountSOQLResult}
                          onChange={(event) => setAccountSOQLResult(event.target.value)}
                        />
                    </CardContent>
                  </Card>

                  <div className="md:col-span-2 flex items-center gap-3 pt-2">
                    <Button className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold gap-2 h-10 px-5 rounded-xl text-xs shadow-md shadow-fuchsia-500/20 transition-all hover:-translate-y-0.5" onClick={handleProcessTransfer} disabled={!assetSOQLResult || !accountSOQLResult}>
                      <ArrowRightLeft className="h-4 w-4" /> Process Transfer
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 h-10 px-4 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" onClick={handleDownloadTransfer} disabled={!transferOutput}>
                      <Download className="h-4 w-4 text-slate-400" /> Download CSV
                    </Button>
                  </div>
                </div>'''

content = re.sub(target, replacement, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Split SOQL Results Processing into 2 cards")
