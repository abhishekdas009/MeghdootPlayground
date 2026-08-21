import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Remove the viewport constraint from the isCaseAssign wrapper so it can breathe and show Round Robin cards without squishing!
text = text.replace(
    '<div className="space-y-6 w-full col-span-1 2xl:col-span-2 flex flex-col h-[calc(100vh-120px)] min-h-[650px]">',
    '<div className="space-y-6 w-full col-span-1 2xl:col-span-2 flex flex-col">'
)

# 2. Put a fixed height on the 3-column grid itself so it guarantees identical heights without ballooning!
text = text.replace(
    '<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6 items-stretch w-full flex-1 min-h-0">',
    '<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-6 items-stretch w-full h-[580px]">'
)

# 3. Fix the "Generate Assignment" button so it doesn't get squished horizontally before wrapping
text = text.replace(
    'className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs gap-2 h-10 px-4 sm:px-5 flex-1 whitespace-nowrap shadow-md shadow-purple-500/20 rounded-xl transition-all hover:-translate-y-0.5"',
    'className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs gap-2 h-10 px-4 sm:px-5 flex-[2] min-w-[180px] whitespace-nowrap shadow-md shadow-purple-500/20 rounded-xl transition-all hover:-translate-y-0.5"'
)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Layout fixed!')
