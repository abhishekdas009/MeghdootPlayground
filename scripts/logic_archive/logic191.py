with open("frontend/app/ticket-formatter/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()
    
# Let's print out the first 200 lines to understand the structure
lines = content.split('\n')
for i in range(150):
    print(f"Line {i+1}: {lines[i]}")
