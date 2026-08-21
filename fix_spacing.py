import re

with open("frontend/app/soql-generator/page.tsx", "r", encoding="utf-8") as f:
    page = f.read()

# 1. Fix Watermark positions
page = page.replace(
    'className="absolute top-4 left-6 pointer-events-none select-none z-0 overflow-hidden"',
    'className="absolute top-2 left-4 md:top-3 md:left-5 pointer-events-none select-none z-0 overflow-hidden opacity-90"'
)

# 2. Fix Watermark text sizes
page = page.replace(
    'className="whitespace-nowrap text-[70px] md:text-[80px] lg:text-[90px] leading-[0.85] font-black tracking-tighter',
    'className="whitespace-nowrap text-[45px] md:text-[55px] lg:text-[65px] leading-[0.8] font-black tracking-tighter'
)
page = page.replace(
    'className="whitespace-nowrap text-[60px] md:text-[70px] lg:text-[80px] leading-[0.85] font-black tracking-tighter',
    'className="whitespace-nowrap text-[40px] md:text-[50px] lg:text-[60px] leading-[0.8] font-black tracking-tighter'
)

# 3. Fix Title container top margin
page = page.replace(
    'mt-12 md:mt-14',
    'mt-6 md:mt-8'
)
page = page.replace(
    'mt-10 md:mt-12',
    'mt-5 md:mt-6'
)

# 4. Fix Title text sizes
page = page.replace(
    'className="text-3xl md:text-4xl font-black tracking-tight flex-1 leading-[1.1]',
    'className="text-xl md:text-2xl font-black tracking-tight flex-1 leading-[1.1]'
)

# 5. Fix card paddings (p-6 -> p-5) for headers
page = page.replace(
    'CardHeader className="pb-4 bg-transparent p-6 relative z-10"',
    'CardHeader className="pb-3 bg-transparent p-4 md:p-5 relative z-10"'
)

# 6. Reduce top gradient banner ("SOQL Generator")
banner_old = 'className="p-8 md:p-10 relative overflow-hidden rounded-[2.5rem]'
banner_new = 'className="p-6 md:p-8 relative overflow-hidden rounded-[2rem]'
page = page.replace(banner_old, banner_new)

# Reduce the height of the SOQL Generator title
page = page.replace(
    'text-5xl md:text-6xl font-black tracking-tighter',
    'text-4xl md:text-5xl font-black tracking-tighter'
)
page = page.replace(
    'h-16 w-16 md:h-20 md:w-20',
    'h-12 w-12 md:h-14 md:w-14'
)
page = page.replace(
    'h-8 w-8 md:h-10 md:w-10',
    'h-6 w-6 md:h-7 md:w-7'
)

# Fix textarea minimum heights so they don't force a massive scroll
page = page.replace('min-h-[220px]', 'min-h-[140px]')
page = page.replace('min-h-[180px]', 'min-h-[120px]')
page = page.replace('min-h-[160px]', 'min-h-[120px]')
page = page.replace('min-h-[500px]', 'min-h-[350px]')

with open("frontend/app/soql-generator/page.tsx", "w", encoding="utf-8") as f:
    f.write(page)
print("Applied spacing and typography reductions successfully!")
