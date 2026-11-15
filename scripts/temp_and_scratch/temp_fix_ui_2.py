import os
import re

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# FOR EMAIL watermark
email_watermark = r'''<div className="absolute top-0 left-2 md:top-0 md:left-4 pointer-events-none select-none z-0 opacity-100">
            <span className="whitespace-nowrap text-[90px] md:text-[130px] lg:text-[150px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/10 dark:to-transparent bg-clip-text text-transparent">
              FOR EMAIL
            </span>
          </div>'''

# Replace Email Template Output
pattern_email = r'(<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">)\s*(<div className="flex items-center justify-between gap-3">)\s*(<div className="flex items-center gap-3">)\s*(<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">)\s*(<Mail className="h-5 w-5" />)\s*(</div>)\s*(<CardTitle className="text-base font-black tracking-tight text-foreground">Email Template Output</CardTitle>)'

new_email = r'\1\n          ' + email_watermark + r'\n\2\n\3\n<div className="flex items-center gap-3">\n<CardTitle className="text-[28px] md:text-[34px] font-black tracking-tighter leading-[1.05] text-foreground">Email Template<br/>Output</CardTitle>'

content = re.sub(pattern_email, new_email, content, flags=re.MULTILINE)

# FOR POST watermark
post_watermark = r'''<div className="absolute top-0 left-2 md:top-0 md:left-4 pointer-events-none select-none z-0 opacity-100">
            <span className="whitespace-nowrap text-[90px] md:text-[130px] lg:text-[150px] leading-none font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/10 dark:to-transparent bg-clip-text text-transparent">
              FOR POST
            </span>
          </div>'''

# Replace Chatter / Post Template
pattern_post = r'(<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">)\s*(<div className="flex items-center justify-between gap-3">)\s*(<div className="flex items-center gap-3">)\s*(<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-inner">)\s*(<MessageSquare className="h-5 w-5" />)\s*(</div>)\s*(<CardTitle className="text-base font-black tracking-tight text-foreground">Chatter / Post Template</CardTitle>)'

new_post = r'\1\n          ' + post_watermark + r'\n\2\n\3\n<div className="flex items-center gap-3">\n<CardTitle className="text-[28px] md:text-[34px] font-black tracking-tighter leading-[1.05] text-foreground">Chatter / Post<br/>Template</CardTitle>'

content = re.sub(pattern_post, new_post, content, flags=re.MULTILINE)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Email and Post Templates")
