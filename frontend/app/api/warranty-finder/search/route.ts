import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  matchesWarrantyDate,
  matchesWarrantyBranch,
  matchesWarrantyModel,
  normalizeWarrantyModel,
  parseFinderInstallationDate,
  repairWarrantyText,
} from '@/lib/warranty';

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

    // Fetch candidate conditions from DB
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

    // Hierarchical evaluation order:
    // 1. Installation Date Operator (Between / Greater Than / More Than)
    // 2. Branch Operator (IN / NOT IN)
    // 3. Model Operator (IN / Equals)
    for (const cond of candidateConditions) {
      // 1. First check Installation Date Operator
      if (!matchesWarrantyDate(dateToSearch, cond.installationDateOperator, cond.installationFrom, cond.installationTo)) {
        continue;
      }

      // 2. Then check Branch Operator
      if (!matchesWarrantyBranch(branch, cond.branchOperator, cond.branches)) {
        continue;
      }

      // 3. Then check Model Operator
      if (!matchesWarrantyModel(normalizedModel, cond.modelOperator, cond.models)) {
        continue;
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
