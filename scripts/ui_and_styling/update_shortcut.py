with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('{ id: "14", name: "CANCELLATION EXCEPTION", icon: "FileWarning" },', '{ id: "19", name: "CANCELLATION REQUESTED", icon: "FileWarning" },')

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
