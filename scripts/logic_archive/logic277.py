with open("frontend/app/api/warranty-finder/search/route.ts", "r", encoding="utf-8") as f:
    content = f.read()

import_str = "import { NextResponse } from 'next/server';"
if import_str in content:
    print("Found API route")
