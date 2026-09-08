with open("frontend/app/dashboard/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'const excelOperationCount = useDashboardStore((s) => s.excelOperationCount);',
    'const warrantyCheckCount = useDashboardStore((s) => s.warrantyCheckCount);'
)

content = content.replace(
    'const excelOperationCountTotal = useDashboardStore((s) => s.excelOperationCountTotal);',
    'const warrantyCheckCountTotal = useDashboardStore((s) => s.warrantyCheckCountTotal);'
)

content = content.replace(
    'const row1Values = [soqlGeneratedCount, excelOperationCount, ticketCancellationCount, assetTransferCount];',
    'const row1Values = [soqlGeneratedCount, warrantyCheckCount, ticketCancellationCount, assetTransferCount];'
)

content = content.replace(
    'const row1TotalValues = [soqlGeneratedCountTotal, excelOperationCountTotal, ticketCancellationCountTotal, assetTransferCountTotal];',
    'const row1TotalValues = [soqlGeneratedCountTotal, warrantyCheckCountTotal, ticketCancellationCountTotal, assetTransferCountTotal];'
)

with open("frontend/app/dashboard/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated dashboard page")
