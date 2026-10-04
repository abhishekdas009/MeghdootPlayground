import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { productSubFamily } = await request.json();

    if (!productSubFamily || typeof productSubFamily !== 'string') {
      return NextResponse.json({ success: false, message: 'Product Sub Family is required.' }, { status: 400 });
    }

    const trimmedSubFamily = productSubFamily.trim();

    const candidateConditions = await prisma.productSubFamilyWarranty.findMany({
      where: {
        productSubFamily: { contains: trimmedSubFamily, mode: 'insensitive' }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const exactMatches = candidateConditions.filter(cond => {
      if (!cond.productSubFamily) return false;
      const subs = cond.productSubFamily.split(',').map(s => s.trim().toLowerCase());
      return subs.includes(trimmedSubFamily.toLowerCase());
    });

    if (exactMatches.length > 0) {
      // Return unique terms
      const uniqueConditions = exactMatches.filter((v, i, a) => a.findIndex(t => t.warrantyTermName === v.warrantyTermName) === i);
      return NextResponse.json({
        success: true,
        conditions: uniqueConditions.map(cond => ({
          termName: cond.warrantyTermName,
          operator: cond.productSubFamilyOperator,
        })),
      });
    } else {
      return NextResponse.json({ success: false, message: 'No matching warranty term found for this product sub family.' });
    }
  } catch (error) {
    console.error('Error searching product sub family data:', error);
    return NextResponse.json({ error: 'Internal server error while searching data.' }, { status: 500 });
  }
}
