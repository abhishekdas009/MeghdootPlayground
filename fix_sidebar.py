import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Make sidebar wrapper flex flex-col
# The sidebar wrapper is:
#         <motion.div
#           initial={{ opacity: 0, x: -8 }}
#           animate={{ opacity: 1, x: 0 }}
#           transition={{ duration: 0.25 }}
#           className="2xl:col-span-3 xl:col-span-4 space-y-4 min-w-0"
#         >
text = text.replace(
    'className="2xl:col-span-3 xl:col-span-4 space-y-4 min-w-0"',
    'className="2xl:col-span-3 xl:col-span-4 space-y-4 min-w-0 flex flex-col"'
)

# 2. Make the Upload/Paste card flex-1
# Currently: <Card className="flex flex-col rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden">
# There are multiple cards with this. Let's target the exact one that wraps Paste Ticket Numbers.
# The card comes right after {!isAssetTransfer && !isChildDetailsToParent && (
text = text.replace(
    '{!isAssetTransfer && !isChildDetailsToParent && (\n            <Card className="flex flex-col rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden">',
    '{!isAssetTransfer && !isChildDetailsToParent && (\n            <Card className="flex flex-col flex-1 rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden">'
)

# 3. Inside CardContent, make the isCaseAssign wrapper flex-1
# Currently: <div className="flex flex-col space-y-4">
# Under {isCaseAssign && (
text = text.replace(
    '{isCaseAssign && (\n                  <div className="flex flex-col space-y-4">',
    '{isCaseAssign && (\n                  <div className="flex flex-col flex-1 space-y-4">'
)

# 4. Make the drag and drop box flex-1
# Currently: "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 min-h-[200px] text-center transition-all duration-200 overflow-hidden w-full mx-auto",
text = text.replace(
    '"relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 min-h-[200px] text-center transition-all duration-200 overflow-hidden w-full mx-auto",',
    '"relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 min-h-[200px] text-center transition-all duration-200 overflow-hidden w-full mx-auto flex-1",'
)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Sidebar stretched!')
