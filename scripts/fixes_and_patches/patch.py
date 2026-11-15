import re

file_path = r'e:\MeghdootPlayground\frontend\app\soql-generator\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

template_str = '''  {
    id: "20",
    name: "Product Record Type update",
    category: "Product",
    soql: "SELECT Id,ProductCode, Product2.Name,Product2.RecordType.Name,Product2.Product_Family__r.Name,Product2.Product_Sub_Family__r.Name FROM Product2 WHERE ProductCode IN (\\n{{tickets}}\\n)",
    favourite: false,
    type: "product-record-type-update",
  },'''
content = content.replace('const defaultTemplates: Template[] = [', 'const defaultTemplates: Template[] = [\n' + template_str)

content = content.replace('const isChildDetailsToParent =', 'const isProductRecordTypeUpdate = selectedTemplate == "20" || activeTemplate?.type == "product-record-type-update";\n  const isChildDetailsToParent =')

state_str = '''  const [productResultInput, setProductResultInput] = React.useState("");
  const [productOutput, setProductOutput] = React.useState('"Id"\\t"RecordType.Id"\\n');
  const [productStoredCount, setProductStoredCount] = React.useState(0);'''
content = content.replace('const [cancellationResultBatchCount, setCancellationResultBatchCount] = React.useState(0);', 'const [cancellationResultBatchCount, setCancellationResultBatchCount] = React.useState(0);\n' + state_str)

if 'parseProductRecordResults' not in content:
    content = content.replace('parseAssetTransferPairs', 'parseAssetTransferPairs,\n  parseProductRecordResults')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched basics')
