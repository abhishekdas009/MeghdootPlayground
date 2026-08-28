import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseWarrantyImport } from '@/lib/warranty';

export async function POST(request: Request) {
  try {
    let csvData: string | null = null;
    
    // Check Content-Type to support both JSON and FormData
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      csvData = body.csvData;
    } else {
      const formData = await request.formData();
      const csvFile = formData.get('csvFile') as File | null;
      const csvText = formData.get('csvText') as string | null;
      
      if (csvFile) {
        csvData = await csvFile.text();
      } else if (csvText) {
        csvData = csvText;
      }
    }

    if (!csvData) {
      return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 });
    }

    const parseResult = parseWarrantyImport(csvData);

    if (parseResult.errors.length > 0) {
      return NextResponse.json({ error: parseResult.errors.join('\n') }, { status: 400 });
    }

    if (parseResult.conditions.length === 0) {
      return NextResponse.json({ error: 'No valid rows found in CSV. Make sure you upload or paste in the standard format.' }, { status: 400 });
    }

    // Atomically clear old records and insert new ones in a single transaction.
    // Keeping deleteMany inside the transaction ensures that if any insert fails,
    // the delete is also rolled back and the table is never left empty.
    await prisma.$transaction([
      prisma.warrantyCondition.deleteMany({}),
      prisma.warrantyCondition.createMany({
        data: parseResult.conditions.map(cond => ({
          sourceRow: cond.sourceRow,
          termName: cond.termName,
          duration: cond.duration,
          unitOfTime: cond.unitOfTime,
          installationFrom: cond.installationFrom,
          installationTo: cond.installationTo,
          branchOperator: cond.branchOperator,
          branches: cond.branches,
          models: cond.models
        }))
      })
    ], { maxWait: 20000, timeout: 60000 });

    return NextResponse.json({ success: true, count: parseResult.conditions.length });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error uploading warranty data:', error);
    return NextResponse.json(
      { error: `Upload failed: ${message}` },
      { status: 500 }
    );
  }
}
