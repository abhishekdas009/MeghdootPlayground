import os

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_title = 'Paste Cancellation Tickets'
new_title = '<span className="block">Paste Cancellation</span><span className="block">Tickets</span>'

content = content.replace('"{isCancellation ? "Paste Cancellation Tickets" : isCaseAssign ? "Upload or Paste Case IDs" : "Paste Ticket Numbers"}"', '{isCancellation ? <><span className="block">Paste Cancellation</span><span className="block">Tickets</span></> : isCaseAssign ? "Upload or Paste Case IDs" : "Paste Ticket Numbers"}')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Step 1 title to multiline")
