import os

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Reduce sizes further
old_title = 'text-2xl md:text-[28px] font-black tracking-tighter leading-tight text-foreground'
new_title = 'text-lg md:text-xl font-black tracking-tight leading-tight text-foreground'
content = content.replace(old_title, new_title)

old_s1 = 'text-2xl md:text-[28px] font-black tracking-tighter leading-tight flex-1'
new_s1 = 'text-lg md:text-xl font-black tracking-tight leading-tight flex-1'
content = content.replace(old_s1, new_s1)

# 2. Make them one line
content = content.replace('<><span className="block">Paste Your</span><span className="block">Tickets</span></>', '"Paste Your Tickets"')
content = content.replace('Cancellation<br/>SOQL Batches', 'Cancellation SOQL Batches')
content = content.replace('Paste SOQL<br/>Result Batch', 'Paste SOQL Result Batch')
content = content.replace('Paste Failed<br/>Results', 'Paste Failed Results')
content = content.replace('Email Template<br/>Output', 'Email Template Output')
content = content.replace('Chatter / Post<br/>Template', 'Chatter / Post Template')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CardTitle sizes and made them one line")
