with open("frontend/app/analytics/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

import_str = 'import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";'
if import_str in content:
    print("Found Recharts import.")
else:
    print("Could not find Recharts import.")
