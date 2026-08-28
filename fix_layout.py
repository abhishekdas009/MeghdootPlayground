with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# 1. Update QueryPreviewCard

query_card = re.search(r'(function QueryPreviewCard.*?)function PasteResultCard', content, re.DOTALL)
if query_card:
    q_content = query_card.group(1)
    
    # Update Watermark Div
    q_content = q_content.replace(
        'absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none',
        'absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none'
    )
    # Update Watermark Text Size
    q_content = q_content.replace(
        'text-[35px] md:text-[45px] lg:text-[55px]',
        'text-[40px] md:text-[50px] lg:text-[60px]'
    )
    
    # Update CardHeader
    q_content = q_content.replace(
        'CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10"',
        'CardHeader className="pb-4 bg-transparent p-6 relative z-10"'
    )
    
    # Update Wrapper margin
    q_content = q_content.replace(
        '${step ? "mt-6 md:mt-8" : ""}',
        '${step ? "mt-5 md:mt-6" : ""}'
    )
    
    # Update CardTitle
    q_content = q_content.replace(
        '<CardTitle className="text-base font-black tracking-tight text-foreground">{title}</CardTitle>',
        '<CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">{title}</CardTitle>'
    )
    
    content = content[:query_card.start()] + q_content + content[query_card.end():]

# 2. Update PasteResultCard

paste_card = re.search(r'(function PasteResultCard.*?)export default function', content, re.DOTALL)
if paste_card:
    p_content = paste_card.group(1)
    
    # Update Watermark Div
    p_content = p_content.replace(
        'absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none',
        'absolute top-3 left-4 md:top-4 md:left-6 pointer-events-none'
    )
    # Update Watermark Text Size
    p_content = p_content.replace(
        'text-[35px] md:text-[45px] lg:text-[55px]',
        'text-[40px] md:text-[50px] lg:text-[60px]'
    )
    
    # Update CardHeader
    p_content = p_content.replace(
        'CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10"',
        'CardHeader className="pb-4 bg-transparent p-6 relative z-10"'
    )
    
    # Update Wrapper margin
    p_content = p_content.replace(
        '<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">',
        '<div className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${step ? "mt-5 md:mt-6" : ""}`}>'
    )
    
    # Update CardTitle
    p_content = p_content.replace(
        '<CardTitle className="text-base font-black tracking-tight text-foreground">{title}</CardTitle>',
        '<CardTitle className="text-lg md:text-xl font-black tracking-tight leading-tight text-foreground">{title}</CardTitle>'
    )
    
    # Update CardContent padding
    p_content = p_content.replace(
        '<CardContent className="p-4 md:p-5 pt-0 relative z-10 flex flex-col flex-1">',
        '<CardContent className="p-6 pt-0 relative z-10 flex flex-col flex-1">'
    )
    
    content = content[:paste_card.start()] + p_content + content[paste_card.end():]

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Success")
