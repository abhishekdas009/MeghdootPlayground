import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  matchesWarrantyDate,
  matchesWarrantyBranch,
  matchesWarrantyModel,
  repairWarrantyText,
} from '@/lib/warranty';

export async function POST(request: Request) {
  try {
    const { modelNumber, installationDate, branch } = await request.json();

    if (!modelNumber || !String(modelNumber).trim()) {
      return NextResponse.json({ success: false, message: 'Model Number is required.' }, { status: 400 });
    }

    const cleanModel = String(modelNumber).trim();

    // Fetch conditions from DB
    const allConditions = await prisma.warrantyCondition.findMany({
      orderBy: {
        sourceRow: 'asc'
      }
    });

    const matchedConditions = [];

    // Production-Grade Hierarchical Evaluation Order:
    // 1. Model Check: Matching cleanModel against Modals__c & Model_Operator__c (IN, NOT IN, Equals)
    // 2. Installation Date Check: Evaluates Installation_date_operator__c (Between, Greater Than), Installation_From__c, Installation_To__c
    // 3. Branch Check: Evaluates Branch_Operator__c (IN, NOT IN) & Branch__c (All India if null/empty)
    for (const cond of allConditions) {
      // 1. Model Check
      if (!matchesWarrantyModel(cleanModel, cond.modelOperator, cond.models)) {
        continue;
      }

      // 2. Date Check
      if (!matchesWarrantyDate(installationDate, cond.installationDateOperator, cond.installationFrom, cond.installationTo)) {
        continue;
      }

      // 3. Branch Check
      if (!matchesWarrantyBranch(branch, cond.branchOperator, cond.branches)) {
        continue;
      }

      matchedConditions.push(cond);
    }

    if (matchedConditions.length > 0) {
      // De-duplicate by unique termName so all relevant unique warranty terms are shown
      const uniqueConditions = matchedConditions.filter(
        (v, i, a) => a.findIndex(t => t.termName === v.termName) === i
      );

      return NextResponse.json({
        success: true,
        conditions: uniqueConditions.map(cond => ({
          ...cond,
          termName: repairWarrantyText(cond.termName),
        })),
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Kindly connect with SSG team for Warranty Term Confirmation for the model number : ${cleanModel}`
      });
    }

  } catch (error) {
    console.error('Error searching warranty data:', error);
    return NextResponse.json({ error: 'Internal server error while searching data.' }, { status: 500 });
  }
}
