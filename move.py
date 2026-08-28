import re

file_path = r'e:\MeghdootPlayground\frontend\app\soql-generator\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the block
match = re.search(r'(\s*\{isProductRecordTypeUpdate && \(\(\) => \{.*?\n\s*\}\)\(\)\}\n)', content, re.DOTALL)
if match:
    block = match.group(1)
    # Remove it from the current location
    content = content.replace(block, '')
    
    # Insert it after the QueryPreviewCard in the Output Column
    # It is right after {!isTS && !isSA && !isAssetTransfer && !isChildDetailsToParent && !isCancellation && !isCaseAssign && ( block
    target = '''            <QueryPreviewCard
              title={activeTemplate?.name ?? "Query Preview"}
              subtitle={\\ query preview\}
              batches={otherPreview} isExample={parsedTickets.length === 0}
              batchIndex={otherBatchIndex}
              setBatchIndex={setOtherBatchIndex}
              onCopy={handleCopy}
            />
          )}'''
    
    content = content.replace(target, target + '\n' + block)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Moved block')
else:
    print('Block not found')
