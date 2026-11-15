with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace cols[3] with cols[4]
old_code = 'const accountId = cols[3] || "";'
new_code = 'const accountId = cols[4] || "";'

if old_code in content:
    content = content.replace(old_code, new_code)
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated customChildDetailsProcessor to use cols[4]")
else:
    print("Could not find the code to replace.")
