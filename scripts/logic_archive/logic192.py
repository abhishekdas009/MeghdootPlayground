with open("frontend/app/ticket-formatter/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

new_formats = """const FORMATS: FormatOption[] = [
  { id: "single-quote", label: "Single Quote", wrap: (t: string) => `'${t}'`, join: ",\\n" },
  { id: "double-quote", label: "Double Quote", wrap: (t: string) => `"${t}"`, join: ",\\n" },
  { id: "comma", label: "Comma Separated", wrap: (t: string) => t, join: ", " },
  { id: "json", label: "JSON Array", wrap: (t: string) => `  "${t}"`, join: ",\\n", prefix: "[\\n", suffix: "\\n]" },
  { id: "python-list", label: "Python List", wrap: (t: string) => `    "${t}"`, join: ",\\n", prefix: "[\\n", suffix: "\\n]" },
  { id: "tuple", label: "Python Tuple", wrap: (t: string) => `    "${t}"`, join: ",\\n", prefix: "(\\n", suffix: "\\n)" },
  { id: "java-array", label: "Java Array", wrap: (t: string) => `    "${t}"`, join: ",\\n", prefix: "new String[]{\\n", suffix: "\\n}" },
  { id: "sql-in", label: "SQL IN", wrap: (t: string) => `'${t}'`, join: ", ", prefix: "IN (", suffix: ")" },
  { id: "soql-in", label: "SOQL IN", wrap: (t: string) => `'${t}'`, join: ",\\n  ", prefix: "IN (\\n  ", suffix: "\\n)" },
  { id: "csv", label: "CSV", wrap: (t: string) => t, join: "\\n" },
  { id: "excel-clean-spaces", label: "Excel Clean Spaces", wrap: (t: string) => `=SUBSTITUTE(SUBSTITUTE("${t}", " ", ""), CHAR(160), "")`, join: "\\n" },
];"""

content = re.sub(r'const FORMATS: FormatOption\[\] = \[.*?\];', new_formats, content, flags=re.DOTALL)

with open("frontend/app/ticket-formatter/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Added Excel Clean Spaces format.")
