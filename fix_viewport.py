import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the isCaseAssign wrapper with an explicit viewport height
text = text.replace(
    '<div className="space-y-6 w-full col-span-1 2xl:col-span-2 flex flex-col h-full min-h-[600px]">',
    '<div className="space-y-6 w-full col-span-1 2xl:col-span-2 flex flex-col h-[calc(100vh-120px)] min-h-[650px]">'
)

# And make sure resize-y on the textareas is disabled so the user doesn't manually break the layout by dragging
text = text.replace('resize-y', 'resize-none')

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Viewport height fixed!')
