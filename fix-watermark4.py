import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

def get_watermark(step_num):
    return f'''        <div className="absolute top-0 left-2 md:-top-1 md:left-4 pointer-events-none select-none z-0 overflow-hidden opacity-100">
          <span className="whitespace-nowrap text-[70px] md:text-[90px] lg:text-[110px] leading-[0.8] font-black tracking-tighter bg-gradient-to-b from-slate-400/40 to-transparent dark:from-white/10 dark:to-transparent bg-clip-text text-transparent">
            STEP {step_num}
          </span>
        </div>'''

# First, let's remove the existing watermarks that I added previously, using regex.
# The previous watermark has opacity-90 and leading-[0.8].
old_watermark_pattern = r'^\s*<div className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90">\s*<span className="whitespace-nowrap text-\[45px\] md:text-\[55px\] lg:text-\[65px\] leading-\[0\.8\] font-black tracking-tighter bg-gradient-to-b from-slate-400/50 to-transparent dark:from-white/30 dark:to-transparent bg-clip-text text-transparent">\s*STEP \d\s*</span>\s*</div>\n'
content = re.sub(old_watermark_pattern, '', content, flags=re.MULTILINE)

# Now, add the new watermarks to the correct places.

# Step 1
pattern1 = r'(<Card className="flex flex-col rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative">)'
content, count = re.subn(pattern1, r'\1\n' + get_watermark(1) + r'\n\2', content)

# Step 2
pattern2 = r'(<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">)\s*(<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">)\s*(<div className="flex gap-4 items-start">)\s*(<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-inner mt-1">)'
content, count = re.subn(pattern2, r'\1\n' + get_watermark(2) + r'\n\2\n\3\n\4\n\5', content)

# Step 3
pattern3 = r'(<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col transition-all duration-300 group relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">)\s*(<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">)\s*(<div className="flex items-center gap-4">)\s*(<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">)'
content, count = re.subn(pattern3, r'\1\n' + get_watermark(3) + r'\n\2\n\3\n\4\n\5', content)

# Step 4 (All Records)
pattern4 = r'(<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col 2xl:col-span-1 transition-all duration-300 group relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">)\s*(<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">)\s*(<div className="flex items-center gap-4">)\s*(<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-inner">)'
content, count = re.subn(pattern4, r'\1\n' + get_watermark(4) + r'\n\2\n\3\n\4\n\5', content)

# Step 5 (Paste Failed Results) - Wait, we should also change the badge text from Step 4 to Step 5
pattern5 = r'(<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 h-full flex flex-col 2xl:col-span-1 transition-all duration-300 group relative">)\s*(<CardHeader className="pb-4 bg-transparent p-6 relative z-10">)\s*(<div className="flex items-center gap-4">)\s*(<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-inner">)'
content, count = re.subn(pattern5, r'\1\n' + get_watermark(5) + r'\n\2\n\3\n\4', content)

# Also update the small badge text for Step 5
content = content.replace('Step 4 (Optional)', 'Step 5 (Optional)')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated all 5 steps!")
