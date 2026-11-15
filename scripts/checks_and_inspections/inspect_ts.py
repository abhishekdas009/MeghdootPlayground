import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

is_ts_idx = -1
for i, line in enumerate(lines):
    if 'isTS && (' in line:
        is_ts_idx = i
        break

if is_ts_idx != -1:
    print("".join(lines[is_ts_idx:is_ts_idx+100]))
