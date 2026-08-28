import sys

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

ts_cards = """
              <PasteResultCard
                title="Paste Ticket result"
                subtitle="Transform Status to Accepted"
                value={tsResultPaste}
                onChange={setTsResultPaste}
                transformedValue={transformStatus(tsResultPaste, "Accepted")}
                onCopy={handleCopy}
              />
              <PasteResultCard
                title="Paste Service Appointment result"
                subtitle="Transform Status to None"
                value={saResultPaste}
                onChange={setSaResultPaste}
                transformedValue={transformStatus(saResultPaste, "None")}
                onCopy={handleCopy}
              />
"""

for i, line in enumerate(lines):
    if "isTS && (" in line:
        j = i
        while j < len(lines):
            if "</>" in lines[j] and ")}" in lines[j+1]:
                # Insert cards right before j
                lines.insert(j, ts_cards)
                break
            j += 1
        break

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Success")
