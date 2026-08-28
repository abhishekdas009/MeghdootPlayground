import sys

with open('frontend/app/warranty-finder/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
import_stmt = 'import { TranslucentDatePicker } from "@/components/ui/translucent-date-picker";\n'
content = content.replace('import { cn } from "@/lib/utils";', 'import { cn } from "@/lib/utils";\n' + import_stmt)

# Replace input
old_input = '<input type="date" value={installationDate} onChange={e => setInstallationDate(e.target.value)} onPaste={handleDatePaste} className="w-full bg-transparent border-none outline-none focus:ring-0 text-base font-semibold text-foreground pb-1 dark:[color-scheme:dark] dark:[&::-webkit-calendar-picker-indicator]:invert dark:[&::-webkit-calendar-picker-indicator]:opacity-70" />'
new_input = '<TranslucentDatePicker value={installationDate} onChange={setInstallationDate} className="w-full" />'

content = content.replace(old_input, new_input)

with open('frontend/app/warranty-finder/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Success")
