import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Step 3
old_badge_step3 = '''                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm self-start">
                        {cancellationResultBatchCount} stored batch{cancellationResultBatchCount === 1 ? "" : "es"}
                      </Badge>'''
content = content.replace(old_badge_step3, '')

old_content_end_step3 = '''                      </div>
                    </div>
                  </CardContent>
                </Card>'''

new_content_end_step3 = '''                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 relative z-10">
                      <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-bold hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm bg-transparent" onClick={() => setCancellationStoredRows([])} disabled={uniqueExecutableCancellationRows.length === 0}>
                        <Trash2 className="h-3.5 w-3.5" /> Clear Stored
                      </Button>
                      <span className="text-sm font-bold text-slate-500">{cancellationResultBatchCount} Stored Batches</span>
                    </div>
                  </CardContent>
                </Card>'''
content = content.replace(old_content_end_step3, new_content_end_step3)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Step 3 layout")
