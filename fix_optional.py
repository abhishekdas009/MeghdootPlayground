import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's fix Step 5 to have OPTIONAL badge on the right side
pattern5 = r'''(<div className="flex flex-1 items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-tight text-foreground">Paste Failed<br/>Results</CardTitle>
                        </div>
                        <p className="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Paste failed tickets to generate stats
                        </p>
                      </div>)
                    </div>
                  </CardHeader>'''

new5 = r'''\1
                      <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm mt-1 shrink-0">OPTIONAL</Badge>
                    </div>
                  </CardHeader>'''

content, count = re.subn(pattern5, new5, content)
print(f"Updated Step 5: {count}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
