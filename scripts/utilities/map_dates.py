import json

data = [
  { "date": "2024-01-15", "name": "Makar Sankranti" },
  { "date": "2024-02-14", "name": "Vasant Panchami" },
  { "date": "2024-03-08", "name": "Maha Shivaratri" },
  { "date": "2024-03-25", "name": "Holi" },
  { "date": "2024-04-17", "name": "Ram Navami" },
  { "date": "2024-04-23", "name": "Hanuman Jayanti" },
  { "date": "2024-08-19", "name": "Raksha Bandhan" },
  { "date": "2024-08-26", "name": "Krishna Janmashtami" },
  { "date": "2024-09-07", "name": "Ganesh Chaturthi" },
  { "date": "2024-10-03", "name": "Navratri (Start / Ghatasthapana)" },
  { "date": "2024-10-12", "name": "Dussehra" },
  { "date": "2024-10-20", "name": "Karwa Chauth" },
  { "date": "2024-10-31", "name": "Diwali" },
  { "date": "2024-11-03", "name": "Bhai Dooj" },
  { "date": "2025-01-14", "name": "Makar Sankranti" },
  { "date": "2025-02-02", "name": "Vasant Panchami" },
  { "date": "2025-02-26", "name": "Maha Shivaratri" },
  { "date": "2025-03-14", "name": "Holi" },
  { "date": "2025-04-06", "name": "Ram Navami" },
  { "date": "2025-04-12", "name": "Hanuman Jayanti" },
  { "date": "2025-08-09", "name": "Raksha Bandhan" },
  { "date": "2025-08-15", "name": "Krishna Janmashtami" },
  { "date": "2025-08-27", "name": "Ganesh Chaturthi" },
  { "date": "2025-09-22", "name": "Navratri (Start / Ghatasthapana)" },
  { "date": "2025-10-02", "name": "Dussehra" },
  { "date": "2025-10-10", "name": "Karwa Chauth" },
  { "date": "2025-10-20", "name": "Diwali" },
  { "date": "2025-10-23", "name": "Bhai Dooj" },
  { "date": "2026-01-14", "name": "Makar Sankranti" },
  { "date": "2026-01-23", "name": "Vasant Panchami" },
  { "date": "2026-02-15", "name": "Maha Shivaratri" },
  { "date": "2026-03-04", "name": "Holi" },
  { "date": "2026-03-26", "name": "Ram Navami" },
  { "date": "2026-04-02", "name": "Hanuman Jayanti" },
  { "date": "2026-08-28", "name": "Raksha Bandhan" },
  { "date": "2026-09-04", "name": "Krishna Janmashtami" },
  { "date": "2026-09-14", "name": "Ganesh Chaturthi" },
  { "date": "2026-10-11", "name": "Navratri (Start / Ghatasthapana)" },
  { "date": "2026-10-20", "name": "Dussehra" },
  { "date": "2026-10-29", "name": "Karwa Chauth" },
  { "date": "2026-11-08", "name": "Diwali" },
  { "date": "2026-11-11", "name": "Bhai Dooj" },
  { "date": "2027-01-15", "name": "Makar Sankranti" },
  { "date": "2027-02-11", "name": "Vasant Panchami" },
  { "date": "2027-03-06", "name": "Maha Shivaratri" },
  { "date": "2027-03-22", "name": "Holi" },
  { "date": "2027-04-15", "name": "Ram Navami" },
  { "date": "2027-04-20", "name": "Hanuman Jayanti" },
  { "date": "2027-08-17", "name": "Raksha Bandhan" },
  { "date": "2027-08-25", "name": "Krishna Janmashtami" },
  { "date": "2027-09-04", "name": "Ganesh Chaturthi" },
  { "date": "2027-09-30", "name": "Navratri (Start / Ghatasthapana)" },
  { "date": "2027-10-09", "name": "Dussehra" },
  { "date": "2027-10-18", "name": "Karwa Chauth" },
  { "date": "2027-10-29", "name": "Diwali" },
  { "date": "2027-10-31", "name": "Bhai Dooj" },
  { "date": "2028-01-15", "name": "Makar Sankranti" },
  { "date": "2028-01-31", "name": "Vasant Panchami" },
  { "date": "2028-02-23", "name": "Maha Shivaratri" },
  { "date": "2028-03-11", "name": "Holi" },
  { "date": "2028-04-03", "name": "Ram Navami" },
  { "date": "2028-04-09", "name": "Hanuman Jayanti" },
  { "date": "2028-08-05", "name": "Raksha Bandhan" },
  { "date": "2028-08-13", "name": "Krishna Janmashtami" },
  { "date": "2028-08-23", "name": "Ganesh Chaturthi" },
  { "date": "2028-09-19", "name": "Navratri (Start / Ghatasthapana)" },
  { "date": "2028-09-27", "name": "Dussehra" },
  { "date": "2028-10-07", "name": "Karwa Chauth" },
  { "date": "2028-10-17", "name": "Diwali" },
  { "date": "2028-10-19", "name": "Bhai Dooj" }
]

ts_map = "export const FESTIVALS_DATES: Record<string, string> = {\n"
for item in data:
    ts_map += f'  "{item["date"]}": "{item["name"]}",\n'
ts_map += "};\n"

with open("frontend/lib/festivals.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("export const FESTIVALS_DATES: Record<string, string> = {\n  // To be populated\n};", ts_map)

with open("frontend/lib/festivals.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Dates mapped!")
