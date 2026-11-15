import os

filepath = 'extension/src/views/FormatterView.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Input textarea
old_class_1 = 'className="flex-1 min-h-0 resize-none rounded-xl border border-white/5 bg-[#0a0a0c] p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-purple-500/50 transition-colors custom-scrollbar placeholder:text-slate-600"'
new_class_1 = 'className="flex-1 min-h-0 resize-none rounded-xl border border-transparent bg-transparent p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-transparent transition-colors custom-scrollbar placeholder:text-slate-600"'

# Output textarea
old_class_2 = 'className="flex-1 min-h-0 resize-none rounded-xl border border-white/5 bg-[#0a0a0c] p-4 text-xs font-mono text-slate-400 focus:outline-none custom-scrollbar placeholder:text-slate-600"'
new_class_2 = 'className="flex-1 min-h-0 resize-none rounded-xl border border-transparent bg-transparent p-4 text-xs font-mono text-slate-400 focus:outline-none custom-scrollbar placeholder:text-slate-600"'

if old_class_1 in content:
    content = content.replace(old_class_1, new_class_1)
    print("Updated input textarea in FormatterView")
else:
    print("Could not find input textarea class")

if old_class_2 in content:
    content = content.replace(old_class_2, new_class_2)
    print("Updated output textarea in FormatterView")
else:
    print("Could not find output textarea class")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
