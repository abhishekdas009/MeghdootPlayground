import sys

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = 'onChange={(event) => setAssetTransferInput(event.target.value)}'
replacement = '''onChange={(event) => {
                      const val = event.target.value;
                      setAssetTransferInput(val);
                      if (!val.trim()) {
                        setAssetSOQLResult("");
                        setAccountSOQLResult("");
                        setTransferOutput("");
                        setTransferDebug("");
                      }
                    }}'''

if target in content:
    content = content.replace(target, replacement)
    with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success")
else:
    print("Failed")
