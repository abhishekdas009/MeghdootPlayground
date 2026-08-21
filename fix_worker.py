import io

with open('frontend/app/workers/fileParser.worker.ts', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('caseIds.push(caseId);', 'if (caseId) caseIds.push(caseId);')

with open('frontend/app/workers/fileParser.worker.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print('Fixed worker!')
