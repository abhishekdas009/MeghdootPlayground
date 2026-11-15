import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# For Step 1
pattern_step1 = r'<div className="flex items-center gap-4 relative z-10 w-full pr-2">.*?<CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight flex-1">\s*\{isCancellation \? <><span className="block">Paste Cancellation</span><span className="block">Tickets</span></> : isCaseAssign \? "Upload or Paste Case IDs" : "Paste Ticket Numbers"\}\s*</CardTitle>\s*</div>'
new_step1 = r'''<div className="flex items-center justify-center relative z-10 w-full">
                    <CardTitle className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-tight text-center">
                      {isCancellation ? "Paste Cancellation Tickets" : isCaseAssign ? "Upload or Paste Case IDs" : "Paste Ticket Numbers"}
                    </CardTitle>
                  </div>'''
content = re.sub(pattern_step1, new_step1, content, flags=re.DOTALL)

# For Step 2, 3, 4, 5
def replace_pill_title(content, step_num, title_line1, title_line2):
    # The current HTML has the glass pill and a multiline CardTitle
    pattern = r'<div className="flex items-center gap-4">\s*<div className="flex items-center gap-2.5 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/60 pr-3 p-1 backdrop-blur-md shadow-sm shrink-0">\s*<div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-500 text-white text-\[11px\] font-black shadow-inner">\s*' + str(step_num) + r'\s*</div>\s*<span className="text-\[11px\] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 mr-1">\s*STEP ' + str(step_num) + r'\s*</span>\s*</div>\s*<CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">\s*<span className="block">' + title_line1 + r'</span>\s*<span className="block">' + title_line2 + r'</span>\s*</CardTitle>\s*</div>'
    
    new_html = r'''<div className="flex items-center justify-center w-full">
                              <CardTitle className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-tight text-foreground text-center">
                                ''' + title_line1 + ' ' + title_line2 + '''
                              </CardTitle>
                            </div>'''
    
    return re.sub(pattern, new_html, content)

content = replace_pill_title(content, 2, "Cancellation", "SOQL Batches")
content = replace_pill_title(content, 3, "Paste SOQL", "Result Batch")
content = replace_pill_title(content, 4, "All", "Records")
content = replace_pill_title(content, 5, "Paste Failed", "Results")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CardTitles")
