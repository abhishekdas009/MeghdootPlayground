import {
  LayoutDashboard,
  Terminal,
  FileSpreadsheet,
  FunctionSquare,
  Ticket,
  LayoutTemplate,
  History,
  BarChart3,
  Settings,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Terminal,
  Sheet: FileSpreadsheet,
  FunctionSquare,
  Ticket,
  LayoutTemplate,
  History,
  BarChart3,
  Settings,
  HelpCircle,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? LayoutDashboard;
}
