import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Make CardContent flex-1
text = text.replace(
    '<CardContent className="p-5 space-y-4 relative z-10">\n                    {/* Compact Add/Update Bar */}',
    '<CardContent className="p-5 space-y-4 relative z-10 flex-1 flex flex-col min-h-[220px]">\n                    {/* Compact Add/Update Bar */}'
)

# Replace max-h-[220px] with flex-1 min-h-[200px]
text = text.replace(
    '<div className="max-h-[220px] overflow-y-auto no-scrollbar space-y-2 pr-1">',
    '<div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 min-h-[200px]">'
)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Roster height fixed!')
