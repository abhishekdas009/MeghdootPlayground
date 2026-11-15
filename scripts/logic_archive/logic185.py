with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "isAssetTransfer" in line or "assetTransfer" in line:
        if "SELECT" in lines[i] or "Component_Id__c" in lines[i]:
            pass
            # Actually, let's just search for the current asset transfer query
