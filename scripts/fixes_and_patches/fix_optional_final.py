import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_str = '''                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Paste failed tickets to generate stats
                      </p>
                    </div>
                  </div>
                </CardHeader>'''

new_str = '''                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Paste failed tickets to generate stats
                      </p>
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm mt-1 shrink-0">OPTIONAL</Badge>
                  </div>
                </CardHeader>'''

content = content.replace(old_str, new_str)
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added OPTIONAL badge")
