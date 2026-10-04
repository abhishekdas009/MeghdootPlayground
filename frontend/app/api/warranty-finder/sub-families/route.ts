import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rawRecords = await prisma.productSubFamilyWarranty.findMany({
      select: { productSubFamily: true }
    });

    const uniqueSet = new Set<string>();
    
    for (const record of rawRecords) {
      if (record.productSubFamily) {
        // Split comma-separated values
        const parts = record.productSubFamily.split(',');
        for (const p of parts) {
          const trimmed = p.trim();
          if (trimmed) {
            uniqueSet.add(trimmed);
          }
        }
      }
    }

    const subFamilies = Array.from(uniqueSet).sort();
    return NextResponse.json({ success: true, subFamilies });
  } catch (error) {
    console.error('Error fetching sub-families:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch sub-families' }, { status: 500 });
  }
}
