with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("h-[350px] xl:h-[calc(50vh-76px)] min-h-[320px]", "h-[500px] xl:h-[calc(100vh-120px)] min-h-[350px]")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
