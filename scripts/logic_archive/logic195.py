with open("frontend/app/ticket-formatter/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old = '  { id: "csv", label: "CSV", wrap: (t: string) => t, join: "\\n" },\n];'
new = '  { id: "csv", label: "CSV", wrap: (t: string) => t, join: "\\n" },\n  { id: "excel-clean-spaces", label: "Excel Clean Spaces", wrap: (t: string) => `=SUBSTITUTE(SUBSTITUTE("${t}", " ", ""), CHAR(160), "")`, join: "\\n" },\n];'

if old in content:
    content = content.replace(old, new)
    with open("frontend/app/ticket-formatter/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Appended format correctly")
else:
    print("Failed to find replacement target")
