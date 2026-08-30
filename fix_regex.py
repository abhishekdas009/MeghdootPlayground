with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_regex_code = """                  // Extract tickets using regex: first a letter, then numbers
                  const cancellationFailedTickets = Array.from(new Set(cancellationFailedInput.match(/[a-zA-Z]\d{5,20}/g) || []));"""

new_parser_code = """                  // Extract tickets using the parser
                  const cancellationFailedTicketsRows = parseCancellationExecutionRows(cancellationFailedInput);
                  const cancellationFailedTickets = Array.from(new Set(cancellationFailedTicketsRows.map(r => r.ticket)));"""

content = content.replace(old_regex_code, new_parser_code)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
