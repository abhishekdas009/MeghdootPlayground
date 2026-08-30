with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_style = """              style={{
                left: menuPosition.left,
                width: menuPosition.width,
                top: menuPosition.top,
                bottom: menuPosition.bottom,
                maxHeight: menuPosition.maxHeight,
              }}"""

new_style = """              style={{
                left: menuPosition.left,
                minWidth: menuPosition.width,
                maxWidth: "calc(100vw - 24px)",
                width: "max-content",
                top: menuPosition.top,
                bottom: menuPosition.bottom,
                maxHeight: menuPosition.maxHeight,
              }}"""

content = content.replace(old_style, new_style)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
