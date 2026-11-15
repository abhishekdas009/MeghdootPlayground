with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I will find the block {isTS && ( <> ... </> )} and replace the order
import re
match = re.search(r'(\{isTS && \(\s*<>\s*)(<QueryPreviewCard[^>]+title="TS.*?/>\s*)(<QueryPreviewCard[^>]+title="SA.*?/>\s*)(<PasteResultCard[^>]+title="Paste Ticket result".*?/>\s*)(<PasteResultCard[^>]+title="Paste Service Appointment result".*?/>\s*)(</>\s*\)})', content, re.DOTALL)
if match:
    new_content = match.group(1) + match.group(2) + match.group(4) + match.group(3) + match.group(5) + match.group(6)
    content = content.replace(match.group(0), new_content)
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success")
else:
    print("Could not find block")
