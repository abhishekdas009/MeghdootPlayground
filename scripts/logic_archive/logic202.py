with open("frontend/app/ticket-formatter/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_format = '{ id: "soql-in-no-spaces", label: "SOQL IN (Clean Spaces)", wrap: (t: string) => `\'${t.replace(/[\\s\\u00A0]+/g, "")}\'`, join: ",\\n  ", prefix: "IN (\\n  ", suffix: "\\n)" }'
new_format = '{ id: "clean-spaces", label: "Remove All Spaces", wrap: (t: string) => t.replace(/[\\s\\u00A0]+/g, ""), join: "\\n" }'

if old_format in content:
    content = content.replace(old_format, new_format)
    with open("frontend/app/ticket-formatter/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced with Remove All Spaces (newline separated)")
else:
    print("Could not find old format to replace")
