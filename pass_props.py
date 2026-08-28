with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix the parent grid
old_grid = 'className="2xl:col-span-9 xl:col-span-8 grid grid-cols-1 2xl:grid-cols-2 gap-6 min-w-0"'
new_grid = 'className={`2xl:col-span-9 xl:col-span-8 grid grid-cols-1 2xl:grid-cols-2 gap-6 min-w-0 ${isTS ? "2xl:grid-rows-2 2xl:h-[calc(100vh-120px)]" : ""}`}'
content = content.replace(old_grid, new_grid)

# Now pass the className prop to the 4 cards in the isTS block
import re
block_match = re.search(r'(\{isTS && \(\s*<>\s*)(<QueryPreviewCard[^>]+title="TS.*?/>\s*)(<PasteResultCard[^>]+title="Paste Ticket result".*?/>\s*)(<QueryPreviewCard[^>]+title="SA.*?/>\s*)(<PasteResultCard[^>]+title="Paste Service Appointment result".*?/>\s*)(</>\s*\)})', content, re.DOTALL)

if block_match:
    def add_class(card_str):
        # insert className before onCopy
        return card_str.replace('onCopy={', 'className="h-[350px] 2xl:h-full min-h-[320px]"\n                  onCopy={')

    new_content = block_match.group(1) + \
                  add_class(block_match.group(2)) + \
                  add_class(block_match.group(3)) + \
                  add_class(block_match.group(4)) + \
                  add_class(block_match.group(5)) + \
                  block_match.group(6)
    content = content.replace(block_match.group(0), new_content)
    
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success")
else:
    print("Could not find isTS block")
