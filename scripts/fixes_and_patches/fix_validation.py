with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_func = """function transformStatus(tsv: string, newStatus: string): string {
  if (!tsv.trim()) return "";
  const lines = tsv.split(/\\r?\\n/);
  if (lines.length < 2) return tsv;

  const delimiter = tsv.includes('\\t') ? '\\t' : (tsv.includes(',') ? ',' : '\\t');"""

new_func = """function transformStatus(tsv: string, newStatus: string, expectedType: "WorkOrder" | "ServiceAppointment"): string {
  if (!tsv.trim()) return "";
  const lines = tsv.split(/\\r?\\n/);
  if (lines.length < 2) return tsv;

  const hasWrongType = lines.some((line, i) => {
    if (i === 0 || !line.trim()) return false;
    if (expectedType === "WorkOrder" && (line.includes("[ServiceAppointment]") || line.includes('"08p'))) return true;
    if (expectedType === "ServiceAppointment" && (line.includes("[WorkOrder]") || line.includes('"0WO'))) return true;
    return false;
  });

  if (hasWrongType) {
    return `ERROR: Invalid data pasted.\\n\\nYou pasted the wrong record type. Please ensure you are pasting ${expectedType} results.`;
  }

  const delimiter = tsv.includes('\\t') ? '\\t' : (tsv.includes(',') ? ',' : '\\t');"""

content = content.replace("function transformStatus(tsv: string, newStatus: string): string {\n    if (!tsv.trim()) return \"\";\n    const lines = tsv.split(/\\r?\\n/);\n    if (lines.length < 2) return tsv;\n  \n    const delimiter = tsv.includes('\\t') ? '\\t' : (tsv.includes(',') ? ',' : '\\t');", new_func)

# Also replace the function calls!
content = content.replace('transformedValue={transformStatus(tsResultPaste, "Accepted")}', 'transformedValue={transformStatus(tsResultPaste, "Accepted", "WorkOrder")}')
content = content.replace('transformedValue={transformStatus(saResultPaste, "None")}', 'transformedValue={transformStatus(saResultPaste, "None", "ServiceAppointment")}')

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
