import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getWarrantyModelAliases,
  isInstallationDateInRange,
  matchesWarrantyBranch,
  normalizeWarrantyModel,
  parseFinderInstallationDate,
  repairWarrantyText,
} from '@/lib/warranty';

function matchesWarrantyModel(
  normalizedModel: string,
  strippedModel: string,
  condition: { models: string | null },
): boolean {
  const aliasesFromModelsField = getWarrantyModelAliases(condition.models);

  return aliasesFromModelsField.includes(normalizedModel) || aliasesFromModelsField.includes(strippedModel);
}

export async function POST(request: Request) {
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
}
