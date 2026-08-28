import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace signature
content = re.sub(
    r'function transformStatus\(tsv: string, newStatus: string\): string \{',
    'function transformStatus(tsv: string, newStatus: string, expectedType?: "WorkOrder" | "ServiceAppointment"): string {',
    content
)

# Insert the validation logic right after checking lines length
validation_code = """
  if (expectedType) {
    const hasWrongType = lines.some((line, i) => {
      if (i === 0 || !line.trim()) return false;
      if (expectedType === "WorkOrder" && (line.includes("[ServiceAppointment]") || line.includes('"08p'))) return true;
      if (expectedType === "ServiceAppointment" && (line.includes("[WorkOrder]") || line.includes('"0WO'))) return true;
      return false;
    });

    if (hasWrongType) {
      return `ERROR: Invalid data pasted.\\n\\nYou pasted the wrong record type. Please ensure you are pasting ${expectedType} results.`;
    }
  }
"""

content = re.sub(
    r'(if \(lines\.length < 2\) return tsv;)',
    r'\1\n' + validation_code,
    content
)

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
