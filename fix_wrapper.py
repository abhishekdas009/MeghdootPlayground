import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make the wrapper a flex col with h-full and min-h-0
text = text.replace(
    '{isCaseAssign && (\n            <div className="space-y-6 w-full col-span-1 2xl:col-span-2">',
    '{isCaseAssign && (\n            <div className="space-y-6 w-full col-span-1 2xl:col-span-2 flex flex-col h-full min-h-0">'
)

# And make the grid inside it flex-1 min-h-0
text = text.replace(
    '<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full">',
    '<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full flex-1 min-h-0">'
)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Wrapper fixed!')
