import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseWarrantyImport } from '@/lib/warranty';
import Papa from 'papaparse';

export async function POST(request: Request) {
  try {
    let csvData: string | null = null;
    let type = 'model';
    
    // Check Content-Type to support both JSON and FormData
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      csvData = body.csvData;
      if (body.type) type = body.type;
    } else {
      const formData = await request.formData();
      const csvFile = formData.get('csvFile') as File | null;
      const csvText = formData.get('csvText') as string | null;
      const typeStr = formData.get('type') as string | null;
      if (typeStr) type = typeStr;
      
      if (csvFile) {
        csvData = await csvFile.text();
      } else if (csvText) {
        csvData = csvText;
      }
    }

    if (!csvData) {
      return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 });
    }

    const parsedTest = Papa.parse(csvData, { header: true, skipEmptyLines: true, preview: 1 });
    const fields = parsedTest.meta.fields || [];
    if (fields.includes('Product_Sub_Family__c')) {
      type = 'subfamily';
    }

    if (type === 'subfamily') {
      const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
      const rows = parsed.data as any[];
      if (rows.length === 0) {
        return NextResponse.json({ error: 'No valid rows found in CSV for sub family' }, { status: 400 });
      }

      // Expect columns: Product_Sub_Family__c, Product_Sub_Family_Operator__c, Warranty_Term__r.WarrantyTermName
      const recordsToInsert = rows.map((row: any) => ({
        sfId: row['Id'] || null,
        productSubFamily: row['Product_Sub_Family__c']?.trim() || null,
        productSubFamilyOperator: row['Product_Sub_Family_Operator__c']?.trim() || null,
        warrantyTermId: row['Warranty_Term__r']?.trim() || null,
        warrantyTermName: (row['Warranty_Term__r.WarrantyTermName'] || row['WarrantyTermName'])?.trim() || null,
      })).filter(r => r.productSubFamily && r.warrantyTermName);

      if (recordsToInsert.length === 0) {
        return NextResponse.json({ error: 'No valid mapping found. Make sure columns like Product_Sub_Family__c and Warranty_Term__r.WarrantyTermName are present.' }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.productSubFamilyWarranty.deleteMany({}),
        prisma.productSubFamilyWarranty.createMany({ data: recordsToInsert })
      ]);

      return NextResponse.json({ success: true, count: recordsToInsert.length });
    }

    const parseResult = parseWarrantyImport(csvData);

    if (parseResult.errors.length > 0) {
      return NextResponse.json({ error: parseResult.errors.join('\n') }, { status: 400 });
    }

    if (parseResult.conditions.length === 0) {
      return NextResponse.json({ error: 'No valid rows found in CSV. Make sure you upload or paste in the standard format.' }, { status: 400 });
    }

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
