import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    '<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6 items-start col-span-1 2xl:col-span-2 w-full">',
    '<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6 items-start w-full">'
)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Round robin grid fixed!')
