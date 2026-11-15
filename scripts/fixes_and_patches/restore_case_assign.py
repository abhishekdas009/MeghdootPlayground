import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    rebuilt = f.read()

# Extract isCaseAssign block
start_idx = rebuilt.find('{isCaseAssign && (\n            <div className="space-y-6 w-full col-span-1 2xl:col-span-2 flex flex-col">')
if start_idx == -1:
    print("Could not find start in rebuilt")
    sys.exit(1)

# Find end by looking for the next top-level block
end_idx = rebuilt.find('{!isTS && !isSA && !isAssetTransfer', start_idx)
if end_idx == -1:
    print("Could not find end in rebuilt")
    sys.exit(1)

case_assign_block = rebuilt[start_idx:end_idx]

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

# Extract the current isCaseAssign block in page.tsx
page_start_idx = page.find('{isCaseAssign && (')
# Wait, there are multiple {isCaseAssign && (. Let's find the main one.
page_start_idx = page.find('{isCaseAssign && (\n            <div className="space-y-6 w-full col-span-1 2xl:col-span-2 xl:col-span-2 flex flex-col">')
if page_start_idx == -1:
    # Try the old signature just in case
    page_start_idx = page.find('{isCaseAssign && (\n            <div className="space-y-6 w-full">')
    
if page_start_idx == -1:
    print("Could not find start in page.tsx")
    sys.exit(1)

page_end_idx = page.find('{!isTS && !isSA && !isAssetTransfer', page_start_idx)
if page_end_idx == -1:
    print("Could not find end in page.tsx")
    sys.exit(1)

new_page = page[:page_start_idx] + case_assign_block + page[page_end_idx:]

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_page)

print("Success: Replaced isCaseAssign block with the one from page_rebuilt.tsx!")
