import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

left_col_start = -1
right_col_start = -1
for i, line in enumerate(lines):
    if "=== LEFT WORKBENCH COLUMN ===" in line:
        left_col_start = i
    if "=== RIGHT RESULTS & MASTER MANAGEMENT COLUMN ===" in line:
        right_col_start = i

print(f"Left col starts at {left_col_start}")
print(f"Right col starts at {right_col_start}")

# Print indentation of left col div vs right col div
if left_col_start != -1 and right_col_start != -1:
    print(lines[left_col_start+1])
    print(lines[right_col_start+1])
