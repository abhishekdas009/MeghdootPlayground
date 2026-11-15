import os

filepath = r'page_rebuilt.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "SOQL Results Processing" in line:
        # found the title, go back to find the Card
        for j in range(i, -1, -1):
            if '<Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/45 shadow-none' in lines[j] and 'xl:col-span-2' in lines[j]:
                start_idx = j
                break
        
        # go forward to find the end of this card
        open_tags = 0
        for j in range(start_idx, len(lines)):
            if '<Card' in lines[j]:
                open_tags += lines[j].count('<Card')
            if '</Card>' in lines[j]:
                open_tags -= lines[j].count('</Card>')
            if open_tags == 0:
                end_idx = j
                break
        break

print(f"Start: {start_idx}, End: {end_idx}")
