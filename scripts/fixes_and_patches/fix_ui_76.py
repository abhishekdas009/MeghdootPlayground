import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I will find the block starting from CardHeader until </CardHeader> containing "Cancellation SOQL Batches"
cancellation_pattern = r'<CardHeader className="pb-4 bg-transparent p-6 relative z-10">.*?Cancellation SOQL Batches.*?</CardHeader>'
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
content = re.sub(cancellation_pattern, cancellation_replacement, content, flags=re.DOTALL)

paste_pattern = r'<CardHeader className="pb-4 bg-transparent p-6 relative z-10">.*?Paste SOQL Result Batch.*?</CardHeader>'
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
content = re.sub(paste_pattern, paste_replacement, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")
