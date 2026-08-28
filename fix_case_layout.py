import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''          {isCaseAssign && (
            <div className="space-y-6 w-full">
              <div className="col-span-1 2xl:col-span-2 xl:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">'''

replacement = '''          {isCaseAssign && (
            <div className="space-y-6 w-full col-span-1 2xl:col-span-2 xl:col-span-2 flex flex-col">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start w-full">'''

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Fixed Case Assign layout wrapper!")
else:
    print("Failed: Target not found.")
