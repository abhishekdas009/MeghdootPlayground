with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

bad = "onClick={() => handleCopy(cancellationQueryBatches[cancellationExecutionBatchIndex])}"
good = "onClick={() => handleCopy(cancellationQueryBatches[cancellationExecutionBatchIndex] || \"\")}"

if bad in page:
    page = page.replace(bad, good)
    print("Fixed type error for cancellation copy button!")
else:
    print("Could not find the target string.")

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
