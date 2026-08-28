import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add h-full to sidebar motion.div
target_sidebar = 'className="2xl:col-span-3 xl:col-span-4 space-y-4 min-w-0 flex flex-col min-h-0"'
rep_sidebar = 'className="2xl:col-span-3 xl:col-span-4 space-y-4 min-w-0 flex flex-col min-h-0 h-full"'
content = content.replace(target_sidebar, rep_sidebar)

# 2. Add flex-1 to STEP 1 card
target_step1_card = '<Card className="flex flex-col rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group transition-all duration-300">'
rep_step1_card = '<Card className="flex flex-col flex-1 min-h-0 rounded-3xl border border-slate-200/50 bg-white/45 shadow-none backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/45 overflow-hidden relative group transition-all duration-300">'
content = content.replace(target_step1_card, rep_step1_card)

# 3. Add flex-1 to isCaseAssign inner div wrapper
target_step1_case = '{isCaseAssign && (\n<div className="flex flex-col space-y-4">'
rep_step1_case = '{isCaseAssign && (\n<div className="flex flex-col flex-1 min-h-0 space-y-4">'
content = content.replace(target_step1_case, rep_step1_case)

# 4. Add flex-1 to dotted drag zone
target_drag_zone = '"relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 min-h-[200px] text-center transition-all duration-200 overflow-hidden w-full mx-auto",'
rep_drag_zone = '"relative flex flex-col flex-1 items-center justify-center rounded-2xl border-2 border-dashed p-10 min-h-[200px] text-center transition-all duration-200 overflow-hidden w-full mx-auto",'
content = content.replace(target_drag_zone, rep_drag_zone)

# 5. Add h-full to right motion.div
target_right_div = 'className="2xl:col-span-9 xl:col-span-8 grid grid-cols-1 2xl:grid-cols-2 gap-6 min-w-0 content-start"'
rep_right_div = 'className="2xl:col-span-9 xl:col-span-8 grid grid-cols-1 2xl:grid-cols-2 gap-6 min-w-0 items-stretch"'
content = content.replace(target_right_div, rep_right_div)

# 6. Add h-full to isCaseAssign wrapper
target_wrapper = '<div className="space-y-6 w-full col-span-1 2xl:col-span-2 xl:col-span-2 flex flex-col">'
rep_wrapper = '<div className="space-y-6 w-full col-span-1 2xl:col-span-2 xl:col-span-2 flex flex-col h-full min-h-0">'
content = content.replace(target_wrapper, rep_wrapper)

# 7. Change items-start to items-stretch and add h-full to the inner grid
target_inner_grid = '<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start w-full">'
rep_inner_grid = '<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch w-full flex-1 min-h-0">'
content = content.replace(target_inner_grid, rep_inner_grid)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Success: Updated layout to align baselines.")
