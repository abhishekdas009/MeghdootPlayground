with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('${step ? "mt-6 md:mt-8" : ""}', '${step ? "mt-5 md:mt-6" : ""}')

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
