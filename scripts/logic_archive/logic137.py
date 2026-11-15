with open("frontend/app/api/warranty-finder/search/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add ranking logic before deduplication
ranking_logic = """
    // Rank conditions by relevance
    matchedConditions.sort((a, b) => {
      // 1. Branch specificity (conditions with specific branches rank higher)
      const aHasBranch = a.branches ? 1 : 0;
      const bHasBranch = b.branches ? 1 : 0;
      if (aHasBranch !== bHasBranch) return bHasBranch - aHasBranch;
      
      // 2. Date specificity (conditions with date ranges rank higher)
      const aHasDate = (a.installationFrom || a.installationTo) ? 1 : 0;
      const bHasDate = (b.installationFrom || b.installationTo) ? 1 : 0;
      if (aHasDate !== bHasDate) return bHasDate - aHasDate;
      
      // 3. Exact model match (normalizedModel) vs stripped model
      const aExact = a.modelAliases.includes(normalizedModel) ? 1 : 0;
      const bExact = b.modelAliases.includes(normalizedModel) ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      
      // Fallback to source row order
      return (a.sourceRow || 0) - (b.sourceRow || 0);
    });

    if (matchedConditions.length > 0) {"""

content = content.replace("    if (matchedConditions.length > 0) {", ranking_logic)

with open("frontend/app/api/warranty-finder/search/route.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Added relevance ranking")
