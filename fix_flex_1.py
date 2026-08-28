import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix Or Paste Manually
for i, line in enumerate(lines):
    if "Or Paste Manually" in line:
        for j in range(i-5, i):
            if "<Card className=" in lines[j] and "shrink-0" in lines[j]:
                lines[j] = lines[j].replace("shrink-0", "flex-1 min-h-0")
                break
        break

# Fix Owner Management
for i, line in enumerate(lines):
    if "Owner Management (" in line:
        for j in range(i-5, i):
            if "<Card className=" in lines[j] and "shrink-0" in lines[j]:
                lines[j] = lines[j].replace("shrink-0", "flex-1 min-h-0")
                break
        break

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Success: Restored flex-1 to Paste Manually and Owner Management")
