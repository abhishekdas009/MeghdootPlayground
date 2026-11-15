import os

filepath = r'frontend\app\soql-generator\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Step 1
content = content.replace(
    'isCancellation ? "Paste Cancellation Tickets" : isCaseAssign ? "Upload or Paste Case IDs" : "Paste Ticket Numbers"',
    'isCancellation ? "Paste Your Tickets" : isCaseAssign ? "Upload or Paste Case IDs" : "Paste Ticket Numbers"'
)
content = content.replace(
    '<CardTitle className="text-base font-black tracking-tight flex-1">',
    '<CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-tight flex-1">'
)

# Step 2
content = content.replace(
    '<CardTitle className="text-base font-black tracking-tight text-foreground">Cancellation SOQL Batches</CardTitle>',
    '<CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-tight text-foreground">Cancellation<br/>SOQL Batches</CardTitle>'
)

# Step 3
content = content.replace(
    '<CardTitle className="text-base font-black tracking-tight text-foreground">Paste SOQL Result Batch</CardTitle>',
    '<CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-tight text-foreground">Paste SOQL<br/>Result Batch</CardTitle>'
)

# Step 4 (All Records)
content = content.replace(
    '<CardTitle className="text-base font-black tracking-tight text-foreground">All Records</CardTitle>',
    '<CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-tight text-foreground">All Records</CardTitle>'
)

# Step 5 (Paste Failed Results)
content = content.replace(
    '<CardTitle className="text-base font-black tracking-tight text-foreground">Paste Failed Results</CardTitle>',
    '<CardTitle className="text-xl md:text-2xl font-black tracking-tight leading-tight text-foreground">Paste Failed<br/>Results</CardTitle>'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated CardTitles")
