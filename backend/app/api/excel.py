from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
import io
import pandas as pd
from typing import List

router = APIRouter()

@router.post("/process")
async def process_excel(
    file: UploadFile = File(...),
    operations: List[str] = None,
):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only .xlsx and .xls files are supported")

    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))

        if operations:
            if "remove-duplicates" in operations:
                df = df.drop_duplicates()
            if "trim-spaces" in operations:
                df = df.applymap(lambda x: x.strip() if isinstance(x, str) else x)
            if "remove-blank-rows" in operations:
                df = df.dropna(how="all")
            if "remove-blank-cols" in operations:
                df = df.dropna(axis=1, how="all")
            if "uppercase" in operations:
                df = df.applymap(lambda x: x.upper() if isinstance(x, str) else x)
            if "lowercase" in operations:
                df = df.applymap(lambda x: x.lower() if isinstance(x, str) else x)
            if "remove-quotes" in operations:
                df = df.applymap(lambda x: x.replace('"', "").replace("'", "") if isinstance(x, str) else x)

        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, index=False)
        output.seek(0)

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=processed_{file.filename}"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
