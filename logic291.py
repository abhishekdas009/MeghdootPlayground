with open("frontend/components/layout/theme-customizer.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("DropdownMenuLabel,", "")
content = content.replace(
    '<DropdownMenuLabel className="text-xs font-bold text-muted-foreground">Accent Color</DropdownMenuLabel>',
    '<div className="px-3 py-2 text-xs font-bold text-muted-foreground">Accent Color</div>'
)

with open("frontend/components/layout/theme-customizer.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Removed DropdownMenuLabel usage.")
