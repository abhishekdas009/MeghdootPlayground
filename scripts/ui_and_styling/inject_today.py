with open("frontend/lib/festivals.ts", "r", encoding="utf-8") as f:
    content = f.read()

import datetime
today = datetime.datetime.now().strftime("%Y-%m-%d")

# Let's forcefully add today's date mapping to Raksha Bandhan just so the user can test the UI!
# But let's also preserve the actual date.
injection = f'\n  // Adding today for immediate testing:\n  "{today}": "Raksha Bandhan",\n'

content = content.replace('export const FESTIVALS_DATES: Record<string, string> = {', 'export const FESTIVALS_DATES: Record<string, string> = {' + injection)

with open("frontend/lib/festivals.ts", "w", encoding="utf-8") as f:
    f.write(content)
print(f"Injected today ({today}) as Raksha Bandhan!")
