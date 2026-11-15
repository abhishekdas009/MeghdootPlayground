import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Component SOQL Query" in line or "Account SOQL Query" in line or "Assignment Mode<br />" in line or "Final Assignment<br />Output" in line:
        for j in range(i-6, i+2):
            if "mt-" in lines[j] and "mt-5 md:mt-6" not in lines[j] and "mt-2 md:mt-3" not in lines[j]:
                print(f"Other mt on Line {j}: {lines[j].strip()}")
            if "<CardTitle" in lines[j] or ("mt-" in lines[j] and "div" in lines[j]):
                print(f"Line {j}: {lines[j].strip()}")
        print("-" * 20)
