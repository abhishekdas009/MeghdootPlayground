import os

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_content = '''              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 xl:col-span-2">
                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">
                  <CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <CardTitle className="mt-4 md:mt-5 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">Asset SOQL Result</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-5 flex-1 flex flex-col relative z-10">
                      <Textarea
                        placeholder={Paste Asset SOQL result here...\\n"_"   "Component_Id__c"   "Id"   "Account.Customer_ID__c"   "Record_Type__c"   "Parent.Id"}
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
                        placeholder={Paste Account SOQL result here...\\n"_"   "Customer_ID__c"   "Id"}
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
              </div>\n'''

# find start and end again to be safe
start_idx = -1
for i, line in enumerate(lines):
    if 'SOQL Results Processing' in line:
        for j in range(i, -1, -1):
            if '<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none' in lines[j] and 'xl:col-span-2' in lines[j]:
                start_idx = j
                break
        break

if start_idx != -1:
    end_idx = start_idx
    while '</Card>' not in lines[end_idx] or 'SOQL Results Processing' in "".join(lines[start_idx:end_idx]):
        end_idx += 1
        if end_idx - start_idx > 60: # safety
            break
            
    # actually, I'll just hardcode 3664 to 3705 based on the previous output
    # but I need to make sure the indices are correct since my array is 0-indexed
    # Let's search for exact strings to be robust
    
    del lines[start_idx:start_idx+42]
    lines.insert(start_idx, new_content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Successfully replaced block")
else:
    print("Could not find block")
