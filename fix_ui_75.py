import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Cancellation SOQL Batches
cancellation_target = r'''<CardHeader className="pb-4 bg-transparent p-6 relative z-10">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
  <div className="flex gap-4 items-start">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-4">
                              <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                                Cancellation SOQL Batches
                              </CardTitle>
                            </div>
                          </div>
                          
                        </div>
                      </div>
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-\[10px\] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm self-start">
                          \{cancellationQueryBatches\.length\} batch\{cancellationQueryBatches\.length === 1 \? "" : "es"\}
                        </Badge>
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-\[10px\] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm self-start">
                      \{cancellationQueryBatches\.length\} batch\{cancellationQueryBatches\.length === 1 \? "" : "es"\}
                      </Badge>
                    </div>
                  </CardHeader>'''

cancellation_replacement = r'''<CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                        Cancellation SOQL Batches
                      </CardTitle>
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm whitespace-nowrap mt-5 md:mt-6">
                        {cancellationQueryBatches.length} BATCH{cancellationQueryBatches.length === 1 ? "" : "ES"}
                      </Badge>
                    </div>
                  </CardHeader>'''

content = re.sub(cancellation_target, cancellation_replacement, content, flags=re.DOTALL)

# Fix Paste SOQL Result Batch
paste_target = r'''<CardHeader className="pb-4 bg-transparent p-6 relative z-10">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
  <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-4">
                              <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                                Paste SOQL Result Batch
                              </CardTitle>
                            </div>
                          </div>
                          
                        </div>
                      </div>
                        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-\[10px\] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm self-start">
                          \{cancellationResultBatchCount\} stored batch\{cancellationResultBatchCount === 1 \? "" : "es"\}
                        </Badge>
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-\[10px\] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm self-start">
                        \{cancellationResultBatchCount\} stored batch\{cancellationResultBatchCount === 1 \? "" : "es"\}
                      </Badge>
                    </div>
                  </CardHeader>'''

paste_replacement = r'''<CardHeader className="pb-4 bg-transparent p-6 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                        Paste SOQL Result Batch
                      </CardTitle>
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm whitespace-nowrap mt-5 md:mt-6">
                        {cancellationResultBatchCount} BATCH{cancellationResultBatchCount === 1 ? "" : "ES"}
                      </Badge>
                    </div>
                  </CardHeader>'''

content = re.sub(paste_target, paste_replacement, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Cleaned up duplicated Badges and layout for Batches cards")
