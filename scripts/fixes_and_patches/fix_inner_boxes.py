import os
import re

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace inner box classes in QueryPreviewCard
old_class = 'className="rounded-2xl text-foreground flex flex-col min-h-0 flex-1 overflow-hidden relative bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 group/glass"'
new_class = 'className="rounded-2xl text-foreground flex flex-col min-h-0 flex-1 overflow-hidden relative bg-transparent border-transparent shadow-none transition-all duration-300 group/glass"'

if old_class in content:
    content = content.replace(old_class, new_class)
    print("Updated QueryPreviewCard inner box")
else:
    print("Could not find QueryPreviewCard inner box")

# Also let's check for CANCELLATION STEP 2 which might have a similar inner box
old_class_cancellation = 'className="rounded-xl bg-slate-100/35 text-foreground flex flex-col min-h-0 flex-1 overflow-hidden dark:bg-black/20"'
new_class_cancellation = 'className="rounded-xl bg-transparent text-foreground flex flex-col min-h-0 flex-1 overflow-hidden border-transparent shadow-none"'

if old_class_cancellation in content:
    content = content.replace(old_class_cancellation, new_class_cancellation)
    print("Updated Cancellation inner box")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
