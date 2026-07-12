export const APP_NAME = "MeghdootPlayground";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "SOQL Generator", href: "/soql-generator", icon: "Terminal" },
  { label: "Excel Automation", href: "/excel-automation", icon: "Sheet" },
  { label: "Formula Generator", href: "/formula-generator", icon: "FunctionSquare" },
  { label: "Ticket Formatter", href: "/ticket-formatter", icon: "Ticket" },
  { label: "Template Manager", href: "/template-manager", icon: "LayoutTemplate" },
  { label: "History", href: "/history", icon: "History" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
  { label: "Settings", href: "/settings", icon: "Settings" },
  { label: "Help", href: "/help", icon: "HelpCircle" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
