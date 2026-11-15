import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('>Email Template Output</CardTitle>', '><span className="block">Email Template</span><span className="block">Output</span></CardTitle>')
content = content.replace('>Chatter / Post Template</CardTitle>', '><span className="block">Chatter / Post</span><span className="block">Template</span></CardTitle>')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Email and Chatter titles to multiline")
