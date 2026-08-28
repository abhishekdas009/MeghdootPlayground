import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# REVERSE fix_ui_21.py (Watermark move to -top-12)
old_pos = 'absolute -top-8 left-4 md:-top-12 md:left-6 pointer-events-none select-none z-0 opacity-100'
new_pos = 'absolute -top-6 left-4 md:-top-8 md:left-6 pointer-events-none select-none z-0 opacity-100'

content = content.replace(old_pos, new_pos)

# REVERSE fix_ui_22.py (Removed subtitles)
# Step 2: "Status not completed, 500 tickets per query"
step2_target = '''<CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                                <span className="block">Cancellation</span>
                                <span className="block">SOQL Batches</span>
                              </CardTitle>
                            </div>'''
if step2_target in content:
    content = content.replace(step2_target, step2_target + '''\n                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              Status not completed, 500 tickets per query
                            </p>''')

# Step 3: "Each paste is stored and converted to Canceled"
step3_target = '''<CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                                <span className="block">Paste SOQL</span>
                                <span className="block">Result Batch</span>
                              </CardTitle>
                            </div>'''
if step3_target in content:
    content = content.replace(step3_target, step3_target + '''\n                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              Each paste is stored and converted to Canceled
                            </p>''')

# Step 4: "Copy table when done"
step4_target = '''<CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                                <span className="block">All</span>
                                <span className="block">Records</span>
                              </CardTitle>
                            </div>'''
if step4_target in content:
    content = content.replace(step4_target, step4_target + '''\n                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              Copy table when done
                            </p>''')

# Step 5: "Paste failed tickets to generate stats"
step5_target = '''<CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">
                                <span className="block">Paste Failed</span>
                                <span className="block">Results</span>
                              </CardTitle>
                            </div>'''
if step5_target in content:
    content = content.replace(step5_target, step5_target + '''\n                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              Paste failed tickets to generate stats
                            </p>''')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Undid watermark move and restored subtitles")
