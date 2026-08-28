code = """
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranslucentDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
}

export function TranslucentDatePicker({ value, onChange, className }: TranslucentDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const toggleOpen = () => setIsOpen(!isOpen);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDate = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${year}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  const handleToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    onChange(`${now.getFullYear()}-${mm}-${dd}`);
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setIsOpen(false);
  };

  // Calendar logic
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Shift firstDay to make Monday = 0, Sunday = 6
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  const days = [];
  
  // Previous month trailing days
  for (let i = 0; i < startDay; i++) {
    days.push({
      day: daysInPrevMonth - startDay + i + 1,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }
  
  // Next month leading days (fill up to 42 slots = 6 rows)
  const remainingSlots = 42 - days.length;
  for (let i = 1; i <= remainingSlots; i++) {
    days.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  let displayValue = "dd-mm-yyyy";
  if (value) {
    const parts = value.split('-');
    if (parts.length === 3) {
      displayValue = `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
    }
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div 
        onClick={toggleOpen}
        className="w-full flex items-center justify-between cursor-pointer bg-transparent border-none outline-none text-base font-semibold text-foreground pb-1"
      >
        <span>{displayValue}</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-full mt-2 w-[280px] z-50 rounded-xl border border-white/10 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-2xl shadow-2xl p-4"
              style={{
                boxShadow: "0 10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-sm text-foreground">
                  {monthNames[month]}, {year}
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-foreground transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 text-foreground transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-primary uppercase">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                  const isSelected = value === `${d.year}-${String(d.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
                  return (
                    <button
                      key={i}
                      onClick={(e) => {
                         e.stopPropagation();
                         handleSelectDate(d.year, d.month, d.day);
                      }}
                      className={cn(
                        "h-8 w-8 flex items-center justify-center rounded-md text-sm transition-colors",
                        isSelected 
                          ? "bg-primary text-primary-foreground font-bold"
                          : d.isCurrentMonth
                            ? "text-foreground hover:bg-black/5 dark:hover:bg-white/10"
                            : "text-muted-foreground opacity-50 hover:bg-black/5 dark:hover:bg-white/10"
                      )}
                    >
                      {d.day}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 dark:border-white/5">
                <button 
                  onClick={handleClear}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
                <button 
                  onClick={handleToday}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Today
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
"""
with open('frontend/components/ui/translucent-date-picker.tsx', 'w', encoding='utf-8') as f:
    f.write(code.strip())
print("Success")
