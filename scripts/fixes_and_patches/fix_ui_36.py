import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I will use a more robust regex to inject the badges
pattern_step2 = r'(<CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">\s*<span className="block">Cancellation</span>\s*<span className="block">SOQL Batches</span>\s*</CardTitle>\s*</div>\s*</div>\s*</div>\s*</div>)'

content = re.sub(pattern_step2, r'\1\n                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm self-start">\n                        {cancellationQueryBatches.length} batch{cancellationQueryBatches.length === 1 ? "" : "es"}\n                      </Badge>', content)


pattern_step3 = r'(<CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">\s*<span className="block">Paste SOQL</span>\s*<span className="block">Result Batch</span>\s*</CardTitle>\s*</div>\s*</div>\s*</div>\s*</div>)'

content = re.sub(pattern_step3, r'\1\n                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm self-start">\n                        {cancellationResultBatchCount} stored batch{cancellationResultBatchCount === 1 ? "" : "es"}\n                      </Badge>', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Regex added badges back")
