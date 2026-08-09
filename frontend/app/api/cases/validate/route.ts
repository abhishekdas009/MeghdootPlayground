import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { caseIds: string[] };
    
    if (!body || !Array.isArray(body.caseIds)) {
      return NextResponse.json({ error: "Invalid request format. 'caseIds' array is required." }, { status: 400 });
    }

    const caseIds = body.caseIds;
    
    // MOCK IMPLEMENTATION:
    // This is where you would connect to Salesforce or your database to validate
    // the Case IDs. Since there is no live connection, we mock the result.
    
    const valid: string[] = [];
    const missing: string[] = [];
    
    for (const id of caseIds) {
      if (id.toUpperCase().includes("MISSING")) {
        missing.push(id);
      } else {
        valid.push(id);
      }
    }
    
    // Simulate slight network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return NextResponse.json({ valid, missing });
  } catch (error) {
    console.error("Error in validate-cases API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
