import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const conditions = await prisma.warrantyCondition.findMany({
      select: { models: true },
      where: { models: { not: null } }
    });

    const uniqueModels = new Set<string>();
    
    for (const cond of conditions) {
      if (!cond.models) continue;
      // split by comma, clean whitespace, remove empty
      const parts = cond.models.split(',').map(m => m.trim().replace(/[\s\u00A0]+/g, '')).filter(Boolean);
      for (const part of parts) {
        uniqueModels.add(part);
      }
    }

    const sortedModels = Array.from(uniqueModels).sort();

    return NextResponse.json({ success: true, models: sortedModels });
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch models' }, { status: 500 });
  }
}
