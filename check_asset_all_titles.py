import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "isAssetTransfer &&" in line:
        start = i
        for j in range(i, len(lines)):
            if "isChildDetailsToParent &&" in lines[j] or "isCancellation &&" in lines[j]:
                end = j
                break
        else:
            end = len(lines)
            
        for j in range(start, end):
            if "<CardTitle" in lines[j]:
                print(f"Line {j}: {lines[j].strip()}")
                # Print the wrapper div too if it has mt
                for k in range(j-3, j):
                    if "mt-" in lines[k]:
                        print(f"Wrapper: {lines[k].strip()}")
        break
