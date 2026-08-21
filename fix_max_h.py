import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Final Assignment Output pre block
# Currently: <pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 min-h-0 no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">
# We want it to have a max height so it doesn't grow infinitely!
# A nice max height is max-h-[400px].
text = text.replace(
    '<pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 min-h-0 no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">',
    '<pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 min-h-[140px] max-h-[400px] no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">'
)

# 2. Or Paste Manually textarea
# Currently: className="flex-1 font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-none p-4 resize-y min-h-[140px]"
# It shouldn't grow infinitely either if pasted into (though textarea usually doesn't, maybe SmartPasteTextarea was doing something? Better safe).
# Actually textarea scrolls by default, but let's ensure it has max-h just in case.
# Wait, textarea doesn't auto-grow unless it's a special component. But let's add max-h-[400px] just in case.
text = text.replace(
    'className="flex-1 font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-none p-4 resize-y min-h-[140px]"',
    'className="flex-1 font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-none p-4 resize-y min-h-[140px] max-h-[400px]"'
)

# 3. Owner Master Roster list
# Currently: <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 min-h-0">
# If there are 50 employees, it would grow infinitely!
# Let's cap it at max-h-[400px].
text = text.replace(
    '<div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 min-h-0">',
    '<div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 min-h-[200px] max-h-[400px]">'
)

# 4. Also left sidebar "Upload or Paste Case IDs" Drag & Drop area / Textarea
# The textarea has: min-h-[320px]
text = text.replace(
    'className="flex-1 font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-none p-4 resize-y min-h-[320px]"',
    'className="flex-1 font-mono text-xs leading-relaxed rounded-xl border border-transparent bg-slate-100/40 dark:bg-black/20 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 shadow-none p-4 resize-y min-h-[320px] max-h-[600px]"'
)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('max-h applied!')
