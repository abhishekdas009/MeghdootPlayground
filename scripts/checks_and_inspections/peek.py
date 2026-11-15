import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# First let's print the actual snippet to see the exact indentation
lines = content.splitlines()
for i, line in enumerate(lines):
    if "Paste Failed<br/>Results" in line:
        for j in range(i-3, i+8):
            print(f"{j}: {lines[j]}")
        break
