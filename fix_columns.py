import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# I will replace the exact line of the comment to insert a column split
old_comment = '{/* 2. Compact High-Density Owner Master Management */}'
new_comment = '</div>\n\n              {/* === COLUMN 3: MASTER ROSTER === */}\n              <div className="space-y-4 flex flex-col relative z-20">\n                {/* 2. Compact High-Density Owner Master Management */}'

text = text.replace(old_comment, new_comment)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Columns split!')
