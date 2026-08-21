import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make the isCaseAssign wrapper have a solid min-h-[600px] so the layout is spacious and beautiful!
text = text.replace(
    '<div className="space-y-6 w-full col-span-1 2xl:col-span-2 flex flex-col h-full min-h-0">',
    '<div className="space-y-6 w-full col-span-1 2xl:col-span-2 flex flex-col h-full min-h-[600px]">'
)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Layout spacing applied!')
