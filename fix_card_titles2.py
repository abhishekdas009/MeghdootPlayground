import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '{isCancellation ? "Paste Your Tickets" : isCaseAssign ? "Upload or Paste Case IDs" : "Paste Ticket Numbers"}',
    '{isCancellation ? <><span className="block">Paste Your</span><span className="block">Tickets</span></> : isCaseAssign ? "Upload or Paste Case IDs" : "Paste Ticket Numbers"}'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Step 1 multiline")
