import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove items-start from the 3-column wrapper so it defaults to items-stretch
text = text.replace(
    '<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start w-full">',
    '<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">'
)

# 2. Add h-full to the column wrappers
# Column 1:
text = text.replace(
    '                {/* === COLUMN 1: WORKBENCH === */}\n              <div className="space-y-4 flex flex-col">',
    '                {/* === COLUMN 1: WORKBENCH === */}\n              <div className="space-y-4 flex flex-col h-full">'
)
# Column 2:
text = text.replace(
    '              {/* === RIGHT RESULTS & MASTER MANAGEMENT COLUMN === */}\n              <div className="space-y-4 flex flex-col">',
    '              {/* === COLUMN 2: RESULTS === */}\n              <div className="space-y-4 flex flex-col h-full">'
)
# Column 3:
text = text.replace(
    '              {/* === COLUMN 3: MASTER ROSTER === */}\n              <div className="space-y-4 flex flex-col relative z-20">',
    '              {/* === COLUMN 3: MASTER ROSTER === */}\n              <div className="space-y-4 flex flex-col relative z-20 h-full">'
)

# 3. Add flex-1 to the cards so they stretch
# Column 1 Card 2 (Or Paste Manually)
# It's currently: <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 relative group">
# Let's target it precisely
text = text.replace(
    '                {/* 2. Paste Manually (Case Assign Mode) */}\n                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 relative group">',
    '                {/* 2. Paste Manually (Case Assign Mode) */}\n                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col flex-1 transition-all duration-300 relative group">'
)

# Column 2 Card (Final Assignment Output)
text = text.replace(
    '                {/* 1. Assignment Output Box (Right at the Top so you see results without scrolling!) */}\n                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col transition-all duration-300 relative group">',
    '                {/* 1. Assignment Output Box (Right at the Top so you see results without scrolling!) */}\n                <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 flex flex-col flex-1 transition-all duration-300 relative group">'
)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Card heights fixed!')
