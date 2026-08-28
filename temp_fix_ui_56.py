import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# I will find the Category Breakdown card and remove the watermark inside it.
pattern = r'\{showStats && !isAssetTransfer && !isChildDetailsToParent && !isCaseAssign && \(\s*<Card className="rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl\s*dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group">\s*\{/\* WATERMARK \*/\}\s*<div className="absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none select-none z-0\s*opacity-100">\s*<span className="text-\[35px\] md:text-\[45px\] lg:text-\[55px\] leading-\[0\.9\] font-black tracking-tighter\s*bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent\s*flex flex-col">\s*<span>QUERY</span>\s*<span>SELECTION</span>\s*</span>\s*</div>'

replacement = r'{showStats && !isAssetTransfer && !isChildDetailsToParent && !isCaseAssign && (\n              <Card className="rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl \ndark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group">'

content = re.sub(pattern, replacement, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed watermark from Category Breakdown")
