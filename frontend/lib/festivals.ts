export type Festival = {
  name: string;
  wishes: string;
  quote: string;
};

// We will fetch dates for 2024 to 2028 and populate this.
export const FESTIVAL_QUOTES: Record<string, { wishes: string; quote: string }> = {
  "Makar Sankranti": {
    wishes: "Happy Makar Sankranti!",
    quote: "Til gud ghya, aani chill marke kaam kara! 🪁",
  },
  "Maha Shivaratri": {
    wishes: "Har Har Mahadev!",
    quote: "Bholenath ki kripa se aaj ek bhi bug production mein nahi jayega! 🔱",
  },
  "Holi": {
    wishes: "Happy Holi!",
    quote: "Bura na mano Holi hai, par bina test kiye code push kiya toh manager bura maan jayega! 🎨",
  },
  "Ram Navami": {
    wishes: "Jai Shri Ram!",
    quote: "Aaj toh bugs ka bhi vanvas shuru! 🏹",
  },
  "Raksha Bandhan": {
    wishes: "Happy Raksha Bandhan!",
    quote: "Bhai-behan ka pyar ek taraf, aur 'Bhai mera code fix kar de' ek taraf! 🧵",
  },
  "Krishna Janmashtami": {
    wishes: "Happy Janmashtami!",
    quote: "Haathi ghoda palki! Aaj makhan ke saath-saath deployment bhi smooth chalega! 🍯",
  },
  "Ganesh Chaturthi": {
    wishes: "Ganpati Bappa Morya!",
    quote: "Vighnaharta, please saare server issues aur deployment failures dur karna! 🐘",
  },
  "Navratri (Start / Ghatasthapana)": {
    wishes: "Happy Navratri!",
    quote: "Garba khelo aur bugs ko dandiya se maaro! 🕺💃",
  },
  "Dussehra": {
    wishes: "Happy Dussehra!",
    quote: "Burai par acchai ki jeet, aur spaghetti code par clean architecture ki jeet! 🏹",
  },
  "Diwali": {
    wishes: "Happy Diwali!",
    quote: "Phatake phodo, par production database mat phod dena! 🪔",
  },
  "Bhai Dooj": {
    wishes: "Happy Bhai Dooj!",
    quote: "Bhai ko aaj bug-free code ka aashirwad mil gaya! 🕉️",
  },
  "Karwa Chauth": {
    wishes: "Happy Karwa Chauth!",
    quote: "Chaand ka intezaar aur API response ka intezaar, dono lamba hota hai! 🌙",
  },
  "Vasant Panchami": {
    wishes: "Happy Vasant Panchami!",
    quote: "Maa Saraswati se prarthana hai ki aaj logic ek baar mein sahi chal jaye! 📚",
  },
  "Hanuman Jayanti": {
    wishes: "Jai Bajrang Bali!",
    quote: "Sanjeevani booti ki jagah aaj hotfix se production bachana padega! 🐒",
  }
};

// Map of YYYY-MM-DD to Festival
export const FESTIVALS_DATES: Record<string, string> = {
  
  "2024-01-15": "Makar Sankranti",
  "2024-02-14": "Vasant Panchami",
  "2024-03-08": "Maha Shivaratri",
  "2024-03-25": "Holi",
  "2024-04-17": "Ram Navami",
  "2024-04-23": "Hanuman Jayanti",
  "2024-08-19": "Raksha Bandhan",
  "2024-08-26": "Krishna Janmashtami",
  "2024-09-07": "Ganesh Chaturthi",
  "2024-10-03": "Navratri (Start / Ghatasthapana)",
  "2024-10-12": "Dussehra",
  "2024-10-20": "Karwa Chauth",
  "2024-10-31": "Diwali",
  "2024-11-03": "Bhai Dooj",
  "2025-01-14": "Makar Sankranti",
  "2025-02-02": "Vasant Panchami",
  "2025-02-26": "Maha Shivaratri",
  "2025-03-14": "Holi",
  "2025-04-06": "Ram Navami",
  "2025-04-12": "Hanuman Jayanti",
  "2025-08-09": "Raksha Bandhan",
  "2025-08-15": "Krishna Janmashtami",
  "2025-08-27": "Ganesh Chaturthi",
  "2025-09-22": "Navratri (Start / Ghatasthapana)",
  "2025-10-02": "Dussehra",
  "2025-10-10": "Karwa Chauth",
  "2025-10-20": "Diwali",
  "2025-10-23": "Bhai Dooj",
  "2026-01-14": "Makar Sankranti",
  "2026-01-23": "Vasant Panchami",
  "2026-02-15": "Maha Shivaratri",
  "2026-03-04": "Holi",
  "2026-03-26": "Ram Navami",
  "2026-04-02": "Hanuman Jayanti",
  "2026-08-28": "Raksha Bandhan",
  "2026-09-04": "Krishna Janmashtami",
  "2026-09-14": "Ganesh Chaturthi",
  "2026-10-11": "Navratri (Start / Ghatasthapana)",
  "2026-10-20": "Dussehra",
  "2026-10-29": "Karwa Chauth",
  "2026-11-08": "Diwali",
  "2026-11-11": "Bhai Dooj",
  "2027-01-15": "Makar Sankranti",
  "2027-02-11": "Vasant Panchami",
  "2027-03-06": "Maha Shivaratri",
  "2027-03-22": "Holi",
  "2027-04-15": "Ram Navami",
  "2027-04-20": "Hanuman Jayanti",
  "2027-08-17": "Raksha Bandhan",
  "2027-08-25": "Krishna Janmashtami",
  "2027-09-04": "Ganesh Chaturthi",
  "2027-09-30": "Navratri (Start / Ghatasthapana)",
  "2027-10-09": "Dussehra",
  "2027-10-18": "Karwa Chauth",
  "2027-10-29": "Diwali",
  "2027-10-31": "Bhai Dooj",
  "2028-01-15": "Makar Sankranti",
  "2028-01-31": "Vasant Panchami",
  "2028-02-23": "Maha Shivaratri",
  "2028-03-11": "Holi",
  "2028-04-03": "Ram Navami",
  "2028-04-09": "Hanuman Jayanti",
  "2028-08-05": "Raksha Bandhan",
  "2028-08-13": "Krishna Janmashtami",
  "2028-08-23": "Ganesh Chaturthi",
  "2028-09-19": "Navratri (Start / Ghatasthapana)",
  "2028-09-27": "Dussehra",
  "2028-10-07": "Karwa Chauth",
  "2028-10-17": "Diwali",
  "2028-10-19": "Bhai Dooj",
};


export function getTodayFestival() {
  const today = new Date().toISOString().split("T")[0] || ""; // YYYY-MM-DD
  const festivalName = FESTIVALS_DATES[today];
  if (festivalName && FESTIVAL_QUOTES[festivalName]) {
    return {
      name: festivalName,
      ...FESTIVAL_QUOTES[festivalName]
    };
  }
  return null;
}
