import os

filepath = 'frontend/app/api/warranty-finder/upload/route.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_code = '''    const { csvData } = await request.json();

    if (!csvData) {
      return NextResponse.json({ error: 'No CSV data provided' }, { status: 400 });
    }'''

new_code = '''    let csvData: string | null = null;
    
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
    }'''

if old_code in content:
    content = content.replace(old_code, new_code)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated route.ts to handle FormData")
else:
    print("Could not find old_code in route.ts")
