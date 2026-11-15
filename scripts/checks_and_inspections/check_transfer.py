import sys

with open('page_rebuilt.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

idx = page.find('{transferDebug && (')
if idx != -1:
    print(page[idx:idx+1500])
