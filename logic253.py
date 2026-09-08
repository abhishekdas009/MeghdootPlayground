with open("frontend/lib/dashboard-metrics.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_metrics = """export const METRIC_DEFINITIONS: Record<string, { label: string; category: string }> = {
  soql_generated: { label: "Queries Generated", category: "soql" },
  excel_operations: { label: "Excel Operations", category: "excel" },"""

new_metrics = """export const METRIC_DEFINITIONS: Record<string, { label: string; category: string }> = {
  soql_generated: { label: "Queries Generated", category: "soql" },
  warranty_checks: { label: "Warranty Checks", category: "warranty" },
  excel_operations: { label: "Excel Operations", category: "excel" },"""

if old_metrics in content:
    content = content.replace(old_metrics, new_metrics)
    with open("frontend/lib/dashboard-metrics.ts", "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated METRIC_DEFINITIONS successfully.")
else:
    print("Could not find METRIC_DEFINITIONS to replace.")
