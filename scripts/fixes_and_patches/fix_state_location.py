import sys

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remove the incorrectly placed state vars
wrong_state = '  const [tsResultPaste, setTsResultPaste] = React.useState("");\n  const [saResultPaste, setSaResultPaste] = React.useState("");\n'
if wrong_state in content:
    content = content.replace(wrong_state, '')

# Inject it into SoqlGenerator
target = 'export default function SoqlGenerator() {\n'
state_vars = '  const [tsResultPaste, setTsResultPaste] = React.useState("");\n  const [saResultPaste, setSaResultPaste] = React.useState("");\n'

content = content.replace(target, target + state_vars)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
