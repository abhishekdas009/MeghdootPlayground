import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# REVERSE fix_ui_24.py (Step 1)
# Currently it has the glass pill and multiline title
current_step1 = '''<div className="flex items-center gap-4 relative z-10 w-full pr-2">
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

old_step1 = '''<div className="flex items-center gap-3 flex-wrap relative z-10 w-full pr-2">
                    {!isCaseAssign && !isCancellation && (
                        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 shadow-sm flex items-center gap-1.5">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white shadow-inner">1</span>
                          Step 1
                        </Badge>
                      )}
                    <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight flex-1">
                      {isCancellation ? "Paste Your Tickets" : isCaseAssign ? "Upload or Paste Case IDs" : "Paste Ticket Numbers"}
                    </CardTitle>
                  </div>'''
content = content.replace(current_step1, old_step1)

# REVERSE fix_ui_26.py (Steps 2, 3, 4, 5 pills)
def restore_old_tiny_pill(content, num, old_title):
    current_pill = f'''<div className="flex items-center gap-4">
                              <div className="flex items-center gap-2.5 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/60 pr-3 p-1 backdrop-blur-md shadow-sm shrink-0">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500 text-white text-[11px] font-black shadow-inner">
                                  {num}
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 mr-1">
                                  STEP {num}
                                </span>
                              </div>
                              <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                                <span className="block">{old_title[0]}</span>
                                <span className="block">{old_title[1]}</span>
                              </CardTitle>
                            </div>'''
    
    old_pill = f'''<div className="flex items-center gap-2 shrink-0 rounded-full border border-slate-500/20 bg-slate-500/10 p-1 pr-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-500 text-[11px] font-black text-white shadow-sm">
                                  {num}
                                </div>
                                <span className="text-[10px] font-black tracking-widest text-slate-600 dark:text-slate-400 uppercase">STEP {num}</span>
                              </div>
                              <CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                                <span className="block">{old_title[0]}</span>
                                <span className="block">{old_title[1]}</span>
                              </CardTitle>'''
    # wait, the old structure didn't have <div className="flex items-center gap-4"> wrapper around them both!
    # Let me check my previous code to see what it replaced exactly.
    # In fix_ui_26.py, I replaced old_pill with 
ew_pill.
    # old_pill was ONLY the pill div!
    # And new_pill was ONLY the pill div!
    # Ah! So the div flex items-center gap-4 was ALREADY THERE?
    return content

# Wait, let's look at fix_ui_26.py
