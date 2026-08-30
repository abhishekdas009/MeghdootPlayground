import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern = r"const cancellationFailedTickets = Array\.from\(new Set\(cancellationFailedInput\.match\(\/\[a-zA-Z\]\\d\{5,20\}\/g\) \|\| \[\]\)\);"
replacement = """const cancellationFailedTicketsRows = parseCancellationExecutionRows(cancellationFailedInput);
                  const cancellationFailedTickets = Array.from(new Set(cancellationFailedTicketsRows.map(r => r.ticket)));"""

content = re.sub(pattern, replacement, content)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
