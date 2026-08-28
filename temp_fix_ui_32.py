import os

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the "X batches" badge from CardHeader in Step 2
old_badge_step2 = '''                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm self-start">
                        {cancellationQueryBatches.length} batch{cancellationQueryBatches.length === 1 ? "" : "es"}
                      </Badge>'''
content = content.replace(old_badge_step2, '')

# 2. Add the bottom row in Step 2 CardContent
old_content_end_step2 = '''                      </div>
                    )}
                  </CardContent>
                </Card>'''

new_content_end_step2 = '''                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto pt-4 relative z-10">
                      <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-bold hover:bg-slate-500/10 hover:text-slate-600 hover:border-slate-500/30 transition-all border-slate-200 dark:border-slate-700 rounded-lg shadow-sm bg-transparent" disabled={cancellationQueryBatches.length === 0}>
                        <Copy className="h-3.5 w-3.5" /> Copy All
                      </Button>
                      <span className="text-sm font-bold text-slate-500">{cancellationQueryBatches.length} Batches</span>
                    </div>
                  </CardContent>
                </Card>'''
content = content.replace(old_content_end_step2, new_content_end_step2)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Step 2 layout")
