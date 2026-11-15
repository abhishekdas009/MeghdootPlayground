import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Step 1 Badge removal for Cancellation
pattern1 = r'(\{!isCaseAssign && \(\s*<Badge.*?>\s*<span.*?>1</span>\s*Step 1\s*</Badge>\s*\)\})'
content = re.sub(pattern1, r'{!isCaseAssign && !isCancellation && (\n                      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 shadow-sm flex items-center gap-1.5">\n                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white shadow-inner">1</span>\n                        Step 1\n                      </Badge>\n                    )}', content)

# 2. Step 2 Header
pattern2 = r'<div className="flex gap-4 items-start">\s*<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-inner mt-1">\s*<Terminal className="h-5 w-5" />\s*</div>\s*<div>\s*<div className="flex items-center gap-2 flex-wrap">\s*<Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-\[10px\] font-black uppercase tracking-widest px-3 py-1 shadow-sm">Step 2</Badge>'
new2 = r'''<div className="flex gap-4 items-start">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">'''
content = re.sub(pattern2, new2, content, flags=re.MULTILINE)

# 3. Step 3 Header
pattern3 = r'<div className="flex items-center gap-4">\s*<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">\s*<FileSpreadsheet className="h-5 w-5" />\s*</div>\s*<div>\s*<div className="flex items-center gap-2 flex-wrap">\s*<Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-\[10px\] font-black uppercase tracking-widest px-3 py-1 shadow-sm">Step 3</Badge>'
new3 = r'''<div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">'''
content = re.sub(pattern3, new3, content, flags=re.MULTILINE)

# 4. Step 4 Header (All Records)
pattern4 = r'<div className="flex items-center gap-4">\s*<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">\s*<CheckCircle2 className="h-5 w-5" />\s*</div>\s*<div>\s*<div className="flex items-center gap-2 flex-wrap">\s*<Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-\[10px\] font-black uppercase tracking-widest px-3 py-1 shadow-sm">Final</Badge>'
new4 = r'''<div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">'''
content = re.sub(pattern4, new4, content, flags=re.MULTILINE)

# 5. Step 5 Header (Paste Failed Results)
pattern5 = r'<div className="flex items-center gap-4">\s*<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-inner">\s*<AlertTriangle className="h-5 w-5" />\s*</div>\s*<div>\s*<div className="flex items-center gap-2 flex-wrap">\s*<Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-\[10px\] font-black uppercase tracking-widest px-3 py-1 shadow-sm">Step 5 \(Optional\)</Badge>'
new5 = r'''<div className="flex flex-1 items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">'''
content = re.sub(pattern5, new5, content, flags=re.MULTILINE)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed colorful cards and icons!")
