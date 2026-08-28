import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

ts_idx = page.find('isTS && (', page.find('className="2xl:col-span-9'))
sa_end = page.find('/>', page.find('title="SA (Service Appointment)"', ts_idx)) + 2

print(page[sa_end:sa_end+100])
