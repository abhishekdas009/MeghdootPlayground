with open("frontend/lib/dashboard-store.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'excel_operations: "excelOperationCount",',
    'excel_operations: "excelOperationCount",\n  warranty_checks: "warrantyCheckCount",'
)

content = content.replace(
    'excelOperationCount: number;\n  excelOperationCountTotal: number;',
    'excelOperationCount: number;\n  excelOperationCountTotal: number;\n  warrantyCheckCount: number;\n  warrantyCheckCountTotal: number;'
)

content = content.replace(
    'excelOperationCount: 0,\n  excelOperationCountTotal: 0,',
    'excelOperationCount: 0,\n  excelOperationCountTotal: 0,\n  warrantyCheckCount: 0,\n  warrantyCheckCountTotal: 0,'
)

content = content.replace(
    'excelOperationCount: 0,\n      ticketsProcessedCount: 0,',
    'excelOperationCount: 0,\n      warrantyCheckCount: 0,\n      ticketsProcessedCount: 0,'
)

with open("frontend/lib/dashboard-store.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated dashboard store")
