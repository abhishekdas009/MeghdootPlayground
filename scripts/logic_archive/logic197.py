with open("frontend/app/ticket-formatter/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the excel-clean-spaces format with the actual string cleaning implementation
old_format = '{ id: "excel-clean-spaces", label: "Excel Clean Spaces", wrap: (t: string) => `=SUBSTITUTE(SUBSTITUTE("${t}", " ", ""), CHAR(160), "")`, join: "\\n" }'
new_format = '{ id: "no-spaces", label: "Remove All Spaces", wrap: (t: string) => t.replace(/[\\s\\u00A0]+/g, ""), join: "\\n" }'

if old_format in content:
    content = content.replace(old_format, new_format)
    with open("frontend/app/ticket-formatter/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced with No Spaces format")
else:
    print("Could not find old format to replace")
