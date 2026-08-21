with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

target = 'className="2xl:col-span-9 xl:col-span-8 grid grid-cols-1 2xl:grid-cols-2 gap-6 min-w-0"'
replacement = 'className="2xl:col-span-9 xl:col-span-8 grid grid-cols-1 2xl:grid-cols-2 gap-6 min-w-0 content-start"'

page = page.replace(target, replacement)
print("Added content-start to Right Column grid.")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
