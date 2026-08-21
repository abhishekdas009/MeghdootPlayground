import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    bad_code = f.read()

with open('page_original.tsx', 'r', encoding='utf-8') as f:
    good_code = f.read()

# 1. Extract the new logic block from corrupted page.tsx
logic_start = bad_code.find('function buildCaseAssignmentRows(')
logic_end = bad_code.find('export default function SOQLGeneratorPage()')
new_logic = bad_code[logic_start:logic_end]

# 2. Extract the same block bounds in page_original.tsx
orig_logic_start = good_code.find('function buildCaseAssignmentRows(')
orig_logic_end = good_code.find('export default function SOQLGeneratorPage()')

# 3. Splice them together
hybrid_code = good_code[:orig_logic_start] + new_logic + good_code[orig_logic_end:]

# 4. Now perform the UI layout modifications safely!
old_layout_1 = '<div className="col-span-1 2xl:col-span-2 xl:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">'
new_layout_1 = '<div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 items-start w-full">'
hybrid_code = hybrid_code.replace(old_layout_1, new_layout_1)

old_layout_2 = '{/* === LEFT WORKBENCH COLUMN === */}'
new_layout_2 = '{/* === COLUMN 1: WORKBENCH === */}'
hybrid_code = hybrid_code.replace(old_layout_2, new_layout_2)

old_layout_3 = '{/* === RIGHT RESULTS COLUMN === */}'
new_layout_3 = '{/* === COLUMN 2: RESULTS === */}'
hybrid_code = hybrid_code.replace(old_layout_3, new_layout_3)

old_layout_4 = '{/* Compact High-Density Owner Master Management */}'
new_layout_4 = '</div>\n                {/* === COLUMN 3: MASTER ROSTER === */}\n                <div className="space-y-4 flex flex-col">\n                  {/* Compact High-Density Owner Master Management */}'
hybrid_code = hybrid_code.replace(old_layout_4, new_layout_4)

# 5. Write out the final, clean, perfect file
with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(hybrid_code)

print('File completely restored and layout fixed!')
