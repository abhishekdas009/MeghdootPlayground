import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "<br />" in line and ("CardTitle" in line or "CardTitle" in lines[i-1]):
        print(f"--- Title: {line.strip()} ---")
        for j in range(i-10, i):
            if "mt-" in lines[j] and "div" in lines[j]:
                print(f"Wrapper: {lines[j].strip()}")
