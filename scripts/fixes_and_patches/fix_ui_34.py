import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# REVERSE fix_ui_30.py (Watermarks)
new_wm_pos = r'absolute top-0 left-0 right-0 flex justify-center pointer-events-none select-none z-0 opacity-100'
old_wm_pos = r'absolute -top-8 left-4 md:-top-12 md:left-6 pointer-events-none select-none z-0 opacity-100'
content = content.replace(new_wm_pos, old_wm_pos)

new_wm_class = r'whitespace-nowrap text-[80px] md:text-[110px] lg:text-[130px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/10 dark:to-transparent bg-clip-text text-transparent opacity-80'
old_wm_class = r'whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/10 dark:to-transparent bg-clip-text text-transparent'
content = content.replace(new_wm_class, old_wm_class)

# REVERSE fix_ui_31.py (Card Titles & Pills)
# Step 1
new_step1 = '''<div className="flex items-center justify-center relative z-10 w-full">
                    <CardTitle className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-tight text-center">
                      {isCancellation ? "Paste Cancellation Tickets" : isCaseAssign ? "Upload or Paste Case IDs" : "Paste Ticket Numbers"}
                    </CardTitle>
                  </div>'''
old_step1 = '''<div className="flex items-center gap-4 relative z-10 w-full pr-2">
                    {isCancellation && (
                      <div className="flex items-center gap-2.5 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/60 pr-3 p-1 backdrop-blur-md shadow-sm shrink-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white text-[11px] font-black shadow-inner">
                          1
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 mr-1">
                          STEP 1
                        </span>
                      </div>
                    )}
                    {!isCaseAssign && !isCancellation && (
                        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 shadow-sm flex items-center gap-1.5 shrink-0">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white shadow-inner">1</span>
                          Step 1
                        </Badge>
                      )}
                    <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight flex-1">
                      {isCancellation ? <><span className="block">Paste Cancellation</span><span className="block">Tickets</span></> : isCaseAssign ? "Upload or Paste Case IDs" : "Paste Ticket Numbers"}
                    </CardTitle>
                  </div>'''
content = content.replace(new_step1, old_step1)

# Step 2, 3, 4, 5
def restore_pill_title(content, step_num, title_line1, title_line2):
    new_html = f'''<div className="flex items-center justify-center w-full">
                              <CardTitle className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-tight text-foreground text-center">
                                {title_line1} {title_line2}
                              </CardTitle>
                            </div>'''
    
    old_html = f'''<div className="flex items-center gap-4">
                              <div className="flex items-center gap-2.5 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/60 pr-3 p-1 backdrop-blur-md shadow-sm shrink-0">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500 text-white text-[11px] font-black shadow-inner">
                                  {step_num}
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 mr-1">
                                  STEP {step_num}
                                </span>
                              </div>
                              <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                                <span className="block">{title_line1}</span>
                                <span className="block">{title_line2}</span>
                              </CardTitle>
                            </div>'''
    return content.replace(new_html, old_html)

content = restore_pill_title(content, 2, "Cancellation", "SOQL Batches")
content = restore_pill_title(content, 3, "Paste SOQL", "Result Batch")
content = restore_pill_title(content, 4, "All", "Records")
content = restore_pill_title(content, 5, "Paste Failed", "Results")


# REVERSE fix_ui_32.py (Step 2 Badges)
# Add back the badge
header_insertion_point_step2 = '''                        </div>
                      </div>'''
header_insertion_point_step2_with_badge = '''                        </div>
                      </div>
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest shadow-sm self-start">
                        {cancellationQueryBatches.length} batch{cancellationQueryBatches.length === 1 ? "" : "es"}
                      </Badge>'''
# Just replace the specific one for Step 2
# Let's use regex to find the right place for Step 2
# Wait, it's easier to just do string replace on the exact code for the footer, and then we'll find where to put the badge.
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

old_content_end_step2 = '''                      </div>
                    )}
                  </CardContent>
                </Card>'''
content = content.replace(new_content_end_step2, old_content_end_step2)

# REVERSE fix_ui_33.py (Step 3 Badges)
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

old_content_end_step3 = '''                      </div>
                    </div>
                  </CardContent>
                </Card>'''
content = content.replace(new_content_end_step3, old_content_end_step3)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Undo mostly complete")
