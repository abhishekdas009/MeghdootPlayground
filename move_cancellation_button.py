import sys
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the CardHeader for Cancellation SOQL Batches
pattern_header = r'''<CardHeader className="pb-4 bg-transparent p-6 relative z-10">\s*<div className="flex items-center justify-between gap-4">\s*<CardTitle className="mt-5 md:mt-6 text-lg md:text-xl font-black tracking-tight leading-tight \s*text-foreground">\s*Cancellation SOQL Batches\s*</CardTitle>\s*<span className="font-black uppercase tracking-widest whitespace-nowrap mt-5 md:mt-6 \s*text-\[10px\] text-slate-500 dark:text-slate-400">\s*\{cancellationQueryBatches\.length\} BATCH\{cancellationQueryBatches\.length === 1 \? "" : "ES"\}\s*</span>\s*</div>\s*</CardHeader>'''

replacement_header = '''<CardHeader className="pb-3 bg-transparent p-6 relative z-10">
                      <div className="flex flex-col w-full relative mt-5 md:mt-6">
                        <div className="absolute top-0 right-0 -mt-1">
                          <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" onClick={() => handleCopy(cancellationQueryBatches[cancellationExecutionBatchIndex] || "")} disabled={!cancellationQueryBatches.length}>
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </Button>
                        </div>
                        <div className="flex items-center justify-between gap-4 pr-[80px]">
                          <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                            Cancellation SOQL Batches
                          </CardTitle>
                          <span className="font-black uppercase tracking-widest whitespace-nowrap text-[10px] text-slate-500 dark:text-slate-400">
                            {cancellationQueryBatches.length} BATCH{cancellationQueryBatches.length === 1 ? "" : "ES"}
                          </span>
                        </div>
                      </div>
                    </CardHeader>'''

content = re.sub(pattern_header, replacement_header, content)

# Remove the floating Copy Query button
pattern_button = r'''<div className="flex items-end justify-between mt-5">\s*<div></div>\s*<Button variant="outline" size="sm" className="[^"]*" onClick=\{[^\}]*\} disabled=\{!cancellationQueryBatches\.length\}>\s*<Copy className="h-3\.5 w-3\.5" /> Copy Query\s*</Button>\s*</div>'''

content = re.sub(pattern_button, "", content)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success")
