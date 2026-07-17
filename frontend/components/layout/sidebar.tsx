"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/ui-store";
import {
  LayoutDashboard,
  TerminalSquare,
  FileSpreadsheet,
  Ticket,
  Layers3,
  Menu,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "SOQL Generator",
    href: "/soql-generator",
    icon: TerminalSquare,
  },
  {
    title: "Excel Automation",
    href: "/excel-automation",
    icon: FileSpreadsheet,
  },
  {
    title: "Ticket Formatter",
    href: "/ticket-formatter",
    icon: Ticket,
  },
  {
    title: "Template Manager",
    href: "/template-manager",
    icon: Layers3,
  },
];

function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <TerminalSquare className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">Meghdoot</p>
              <p className="truncate text-xs text-muted-foreground">Productivity Suite</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                "hover:bg-muted hover:text-foreground",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", collapsed && "mx-auto")} />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <TerminalSquare className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Meghdoot</p>
            <p className="text-xs text-muted-foreground">Productivity Suite</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open sidebar">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <aside
        className={cn(
          "hidden border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:flex lg:flex-col",
          sidebarCollapsed ? "lg:w-[84px]" : "lg:w-72"
        )}
      >
        <div className="flex items-center justify-end border-b border-border px-3 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <div className="min-h-0 flex-1">
          <SidebarContent collapsed={sidebarCollapsed} />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close sidebar overlay"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[88vw] max-w-80 border-r border-border bg-background shadow-xl">
            <div className="flex items-center justify-end border-b border-border px-3 py-3">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close sidebar">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
