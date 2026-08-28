import sys
with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()
for i in range(len(lines)):
    if "Roster offline" in lines[i] and "active owners" in lines[i]:
        lines[i] = "                          {caseOwnerLoadState === \"loading\" ? \"Roster syncing\" : caseOwnerLoadState === \"error\" ? \"Roster offline\" : activeCaseOwners.length + \" active owners\"}\\n"
        break
with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.writelines(lines)
print("Success")
