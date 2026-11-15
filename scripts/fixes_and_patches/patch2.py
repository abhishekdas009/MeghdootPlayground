import re

file_path = r'e:\MeghdootPlayground\frontend\app\soql-generator\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add handleProductResultPaste after handleCancellationResultPaste
logic = '''
  const handleProductResultPaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = event.clipboardData.getData("text");
    if (!pastedText.trim()) return;

    event.preventDefault();
    setProductResultInput(pastedText);

    const result = parseProductRecordResults(pastedText);
    if (result.output && result.output !== "Id"\\t"RecordType.Id") {
      setProductOutput((prev) => {
        if (prev === "Id"\\t"RecordType.Id"\\n || !prev) {
          return result.output + "\\n";
        }
        const lines = result.output.split('\\n');
        if (lines.length > 1) {
          return prev + lines.slice(1).join('\\n') + "\\n";
        }
        return prev;
      });
      setProductStoredCount((prev) => prev + 1);
    }
  };

  const handleProductResultInputChange = (value: string) => {
    setProductResultInput(value);
  };
'''

content = content.replace('const handleCancellationResultInputChange = (value: string) => {', logic + '\n  const handleCancellationResultInputChange = (value: string) => {')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched logic')
