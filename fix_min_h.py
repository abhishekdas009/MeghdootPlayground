import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add min-h-0 to the three columns in isCaseAssign
# Column 1
text = text.replace(
    '                {/* === COLUMN 1: WORKBENCH === */}\n              <div className="space-y-4 flex flex-col h-full">',
    '                {/* === COLUMN 1: WORKBENCH === */}\n              <div className="space-y-4 flex flex-col h-full min-h-0">'
)
# Column 2
text = text.replace(
    '              {/* === COLUMN 2: RESULTS === */}\n              <div className="space-y-4 flex flex-col h-full">',
    '              {/* === COLUMN 2: RESULTS === */}\n              <div className="space-y-4 flex flex-col h-full min-h-0">'
)
# Column 3
text = text.replace(
    '              {/* === COLUMN 3: MASTER ROSTER === */}\n              <div className="space-y-4 flex flex-col relative z-20 h-full">',
    '              {/* === COLUMN 3: MASTER ROSTER === */}\n              <div className="space-y-4 flex flex-col relative z-20 h-full min-h-0">'
)

# And also the cards themselves need min-h-0 if they have flex-1 flex flex-col
text = text.replace(
    'flex flex-col flex-1 transition-all duration-300 relative group',
    'flex flex-col flex-1 min-h-0 transition-all duration-300 relative group'
)

# The CardContent of Results is already min-h-[220px] which is fine.
# The CardContent of Master Roster is min-h-[220px]. Let's change that to min-h-0 so it doesn't force height.
text = text.replace(
    '<CardContent className="p-5 space-y-4 relative z-10 flex-1 flex flex-col min-h-[220px]">',
    '<CardContent className="p-5 space-y-4 relative z-10 flex-1 flex flex-col min-h-0">'
)

# And change the min-h-[200px] on the roster list to min-h-0
text = text.replace(
    '<div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 min-h-[200px]">',
    '<div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 min-h-0">'
)

# Also do it for the Results CardContent
text = text.replace(
    '<CardContent className="p-5 relative z-10 flex-1 flex flex-col min-h-[220px]">',
    '<CardContent className="p-5 relative z-10 flex-1 flex flex-col min-h-0">'
)
# Results Pre block
text = text.replace(
    '<pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 min-h-[140px] no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">',
    '<pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-emerald-200 min-h-0 no-scrollbar selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">'
)


# Sidebar also needs min-h-0 to not force height!
text = text.replace(
    'className="2xl:col-span-3 xl:col-span-4 space-y-4 min-w-0 flex flex-col"',
    'className="2xl:col-span-3 xl:col-span-4 space-y-4 min-w-0 flex flex-col min-h-0"'
)

# Sidebar Card
text = text.replace(
    '<Card className="flex flex-col flex-1 rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden">',
    '<Card className="flex flex-col flex-1 min-h-0 rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden">'
)

# Sidebar CardContent
text = text.replace(
    '<CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col relative z-10">',
    '<CardContent className="p-6 pt-5 space-y-5 flex-1 flex flex-col min-h-0 relative z-10">'
)

# Sidebar inner div
text = text.replace(
    '<div className="flex flex-col flex-1 space-y-4">',
    '<div className="flex flex-col flex-1 min-h-0 space-y-4">'
)

# Sidebar Drag and drop area
text = text.replace(
    '"relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 min-h-[200px] text-center transition-all duration-200 overflow-hidden w-full mx-auto flex-1",',
    '"relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 min-h-0 text-center transition-all duration-200 overflow-hidden w-full mx-auto flex-1",'
)


with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('min-h-0 applied!')
