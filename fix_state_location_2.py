import sys

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target = 'export default function SOQLGeneratorPage() {\n'
state_vars = '  const [tsResultPaste, setTsResultPaste] = React.useState("");\n  const [saResultPaste, setSaResultPaste] = React.useState("");\n'

if target in content and "const [tsResultPaste, setTsResultPaste]" not in content:
    content = content.replace(target, target + state_vars)
    with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Success")
else:
    print("Could not find target or state already exists.")
