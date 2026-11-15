with open("frontend/lib/warranty.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "export function getWarrantyModelAliases" in line or "export function normalizeWarrantyModel" in line or "export function extractSearchPrefixes" in line or "export function matchesWarrantyModel" in line:
        for j in range(max(0, i-2), min(len(lines), i+30)):
            print(f"Line {j}: {lines[j].rstrip()}")
        print("-" * 40)
