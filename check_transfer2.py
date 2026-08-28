import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

idx = page.find('{transferDebug && (')
if idx != -1:
    print(page[idx+2000:idx+2500])
