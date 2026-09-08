with open("frontend/app/api/warranty-finder/search/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

old_post = """export async function POST(request: Request) {
  try {
    const { modelNumber, installationDate, branch } = await request.json();

    const inputModels = typeof modelNumber === "string" 
      ? modelNumber.split(",").map(m => m.trim()).filter(Boolean)
      : [];

    if (inputModels.length === 0) {
      return NextResponse.json({ success: false, message: 'Model Number is required.' }, { status: 400 });
    }

    let parsedDateObj = null;
    if (installationDate) {
      parsedDateObj = parseFinderInstallationDate(installationDate);
      if (!parsedDateObj) {
        return NextResponse.json(
          { success: false, message: 'Installation Date must use dd/mm/yyyy or dd-mm-yyyy format.' },
          { status: 400 },
        );
      }
    }
    const dateToSearch = parsedDateObj ? parsedDateObj.date : null;

    const allMatchedConditions = [];

    for (const inputModel of inputModels) {
      const normalizedModel = normalizeWarrantyModel(inputModel);
      if (!normalizedModel) continue;

      const strippedModel = normalizedModel.replace(/^(?:BO|BI)-/, "");

      const candidateConditions = await prisma.warrantyCondition.findMany({
        where: {
          OR: [
            { models: { contains: normalizedModel, mode: 'insensitive' } },
            { models: { contains: strippedModel, mode: 'insensitive' } },
          ]
        },
        orderBy: { sourceRow: 'asc' }
      });

      for (const cond of candidateConditions) {
         if (!matchesWarrantyModel(normalizedModel, strippedModel, cond)) {
           continue;
         }
         if (dateToSearch) {
           if (!isInstallationDateInRange(dateToSearch, cond.installationFrom, cond.installationTo)) {
             continue;
           }
         }
         if (branch && cond.branches && cond.branchOperator) {
           if (!matchesWarrantyBranch(branch, cond.branchOperator, cond.branches)) {
             continue;
           }
         }
         allMatchedConditions.push({ ...cond, matchedModel: inputModel });
      }
    }

    if (allMatchedConditions.length > 0) {
      // Group by termName
      const grouped = new Map();
      for (const cond of allMatchedConditions) {
        const repairedName = repairWarrantyText(cond.termName);
        if (!grouped.has(repairedName)) {
          grouped.set(repairedName, { ...cond, termName: repairedName, matchedModels: new Set([cond.matchedModel]) });
        } else {
          grouped.get(repairedName).matchedModels.add(cond.matchedModel);
        }
      }
      
      const uniqueConditions = Array.from(grouped.values()).map(cond => ({
        ...cond,
        matchedModels: Array.from(cond.matchedModels)
      }));

      return NextResponse.json({
        success: true,
        conditions: uniqueConditions,
      });
    } else {
      return NextResponse.json({ success: false, message: 'No matching warranty term found' });
    }

  } catch (error) {
    console.error('Error searching warranty data:', error);
    return NextResponse.json({ error: 'Internal server error while searching data.' }, { status: 500 });
  }
}"""

new_post = """export async function POST(request: Request) {
  try {
    const { modelNumber, installationDate, branch } = await request.json();

    const normalizedModel = normalizeWarrantyModel(typeof modelNumber === "string" ? modelNumber : "");
    if (!normalizedModel) {
      return NextResponse.json({ success: false, message: 'Model Number is required.' }, { status: 400 });
    }

    let parsedDateObj = null;
    if (installationDate) {
      parsedDateObj = parseFinderInstallationDate(installationDate);
      if (!parsedDateObj) {
        return NextResponse.json(
          { success: false, message: 'Installation Date must use dd/mm/yyyy or dd-mm-yyyy format.' },
          { status: 400 },
        );
      }
    }
    const dateToSearch = parsedDateObj ? parsedDateObj.date : null;

    const strippedModel = normalizedModel.replace(/^(?:BO|BI)-/, "");

    // Fetch conditions from the DB
    // `modelAliases` is the indexed lookup generated during an import. The
    // `models` condition also supports records edited directly in the database,
    // where the visible model list may have changed without its child aliases.
    const candidateConditions = await prisma.warrantyCondition.findMany({
      where: {
        OR: [
          { models: { contains: normalizedModel, mode: 'insensitive' } },
          { models: { contains: strippedModel, mode: 'insensitive' } },
        ]
      },
      orderBy: {
        sourceRow: 'asc' // maintain insertion order / original order
      }
    });

    const matchedConditions = [];

    // Filter in memory for date and branch
    for (const cond of candidateConditions) {
       if (!matchesWarrantyModel(normalizedModel, strippedModel, cond)) {
         continue;
       }

       // Check date
       if (dateToSearch) {
         if (!isInstallationDateInRange(dateToSearch, cond.installationFrom, cond.installationTo)) {
           continue;
         }
       }

       // Check branch
       if (branch && cond.branches && cond.branchOperator) {
         if (!matchesWarrantyBranch(branch, cond.branchOperator, cond.branches)) {
           continue;
         }
       }

       matchedConditions.push(cond);
    }

    if (matchedConditions.length > 0) {
      const uniqueConditions = matchedConditions.filter((v, i, a) => a.findIndex(t => t.termName === v.termName) === i);
      return NextResponse.json({
        success: true,
        conditions: uniqueConditions.map(cond => ({
          ...cond,
          termName: repairWarrantyText(cond.termName),
        })),
      });
    } else {
      return NextResponse.json({ success: false, message: 'No matching warranty term found' });
    }

  } catch (error) {
    console.error('Error searching warranty data:', error);
    return NextResponse.json({ error: 'Internal server error while searching data.' }, { status: 500 });
  }
}"""

if old_post in content:
    content = content.replace(old_post, new_post)
    with open("frontend/app/api/warranty-finder/search/route.ts", "w", encoding="utf-8") as f:
        f.write(content)
    print("Reverted API route to single search.")
else:
    print("Could not find POST function to revert.")
