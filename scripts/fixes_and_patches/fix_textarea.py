import os

filepath = 'frontend/app/ticket-formatter/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Left textarea classes
old_class_1 = 'className="flex-1 min-h-[350px] font-mono text-sm leading-relaxed rounded-2xl border border-slate-300 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl text-slate-800 dark:text-slate-100 focus-visible:ring-4 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 p-6 shadow-inner transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"'
new_class_1 = 'className="flex-1 min-h-[350px] font-mono text-sm leading-relaxed rounded-2xl border-transparent bg-transparent text-slate-800 dark:text-slate-100 focus-visible:ring-0 focus-visible:outline-none p-6 shadow-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"'

# Right textarea classes
old_class_2 = 'className="h-full min-h-[250px] font-mono text-sm leading-relaxed rounded-2xl border border-slate-300 dark:border-slate-700/50 bg-slate-50/80 dark:bg-[#0a0f1c]/80 backdrop-blur-xl text-slate-800 dark:text-slate-200 p-6 shadow-inner transition-all resize-none custom-scrollbar focus-visible:ring-0"'
new_class_2 = 'className="h-full min-h-[250px] font-mono text-sm leading-relaxed rounded-2xl border-transparent bg-transparent text-slate-800 dark:text-slate-200 p-6 shadow-none transition-all resize-none custom-scrollbar focus-visible:ring-0 focus-visible:outline-none"'

if old_class_1 in content:
    content = content.replace(old_class_1, new_class_1)
    print("Updated textarea 1")
else:
    print("Could not find textarea 1")

if old_class_2 in content:
    content = content.replace(old_class_2, new_class_2)
    print("Updated textarea 2")
else:
    print("Could not find textarea 2")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
