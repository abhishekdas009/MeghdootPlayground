import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Step 2 header badge
# I know it was right after the </div>\n                      </div> that wraps the title block.
# The title block for Step 2:
title_block_step2 = '''                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2.5 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/60 pr-3 p-1 backdrop-blur-md shadow-sm shrink-0">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500 text-white text-[11px] font-black shadow-inner">
                                  2
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 mr-1">
                                  STEP 2
                                </span>
                              </div>
                              <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                                <span className="block">Cancellation</span>
                                <span className="block">SOQL Batches</span>
                              </CardTitle>
                            </div>
                          </div>
                          
                        </div>
                      </div>'''

if title_block_step2 in content:
    content = content.replace(title_block_step2, title_block_step2 + '''\n                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm self-start">
                        {cancellationQueryBatches.length} batch{cancellationQueryBatches.length === 1 ? "" : "es"}
                      </Badge>''')
else:
    print("Could not find step 2 title block to inject badge")


title_block_step3 = '''                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2.5 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/60 pr-3 p-1 backdrop-blur-md shadow-sm shrink-0">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500 text-white text-[11px] font-black shadow-inner">
                                  3
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 mr-1">
                                  STEP 3
                                </span>
                              </div>
                              <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                                <span className="block">Paste SOQL</span>
                                <span className="block">Result Batch</span>
                              </CardTitle>
                            </div>
                          </div>
                          
                        </div>
                      </div>'''

if title_block_step3 in content:
    content = content.replace(title_block_step3, title_block_step3 + '''\n                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm self-start">
                        {cancellationResultBatchCount} stored batch{cancellationResultBatchCount === 1 ? "" : "es"}
                      </Badge>''')
else:
    print("Could not find step 3 title block to inject badge")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added badges back")
