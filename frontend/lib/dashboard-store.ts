"use client";

import * as React from "react";

export type Activity = {
  id: string;
  type: "soql" | "excel" | "ticket" | "favourite";
  title: string;
  description: string;
  timestamp: number;
  template?: string;
  ticketCount?: number;
  rows?: number;
};

export type DashboardStats = {
  queriesGenerated: number;
  excelOperations: number;
  historyItems: number;
  favourites: number;
  activities: Activity[];
};

function createId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds} sec ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} day ago`;
}

class DashboardStore {
  private state: DashboardStats = {
    queriesGenerated: 0,
    excelOperations: 0,
    historyItems: 0,
    favourites: 0,
    activities: [],
  };
  private listeners = new Set<() => void>();

  getState() {
    return this.state;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  recordSOQL(template: string, ticketCount: number) {
    this.state.queriesGenerated += 1;
    this.state.historyItems += 1;
    this.state.activities.unshift({
      id: createId(),
      type: "soql",
      title: "Generated SOQL query",
      description: `${template} • ${ticketCount} ticket${ticketCount === 1 ? "" : "s"}`,
      timestamp: Date.now(),
      template,
      ticketCount,
    });
    if (this.state.activities.length > 20) this.state.activities.pop();
    this.notify();
  }

  recordExcel(description: string, rows?: number) {
    this.state.excelOperations += 1;
    this.state.historyItems += 1;
    this.state.activities.unshift({
      id: createId(),
      type: "excel",
      title: "Excel operation",
      description: rows ? `${description} • ${rows} rows` : description,
      timestamp: Date.now(),
      rows,
    });
    if (this.state.activities.length > 20) this.state.activities.pop();
    this.notify();
  }

  recordTicketFormat(ticketCount: number) {
    this.state.historyItems += 1;
    this.state.activities.unshift({
      id: createId(),
      type: "ticket",
      title: "Ticket format",
      description: `SOQL IN format • ${ticketCount} ticket${ticketCount === 1 ? "" : "s"}`,
      timestamp: Date.now(),
      ticketCount,
    });
    if (this.state.activities.length > 20) this.state.activities.pop();
    this.notify();
  }

  recordFavourite(templateName: string) {
    this.state.favourites += 1;
    this.state.historyItems += 1;
    this.state.activities.unshift({
      id: createId(),
      type: "favourite",
      title: "Favourited template",
      description: templateName,
      timestamp: Date.now(),
      template: templateName,
    });
    if (this.state.activities.length > 20) this.state.activities.pop();
    this.notify();
  }

  removeFavourite() {
    this.state.favourites = Math.max(0, this.state.favourites - 1);
    this.notify();
  }

  recordHistory(title: string, description: string) {
    this.state.historyItems += 1;
    this.state.activities.unshift({
      id: createId(),
      type: "soql",
      title,
      description,
      timestamp: Date.now(),
    });
    if (this.state.activities.length > 20) this.state.activities.pop();
    this.notify();
  }

  reset() {
    this.state = {
      queriesGenerated: 0,
      excelOperations: 0,
      historyItems: 0,
      favourites: 0,
      activities: [],
    };
    this.notify();
  }
}

export const dashboardStore = new DashboardStore();

export function useDashboardStore() {
  const [state, setState] = React.useState<DashboardStats>(dashboardStore.getState());
  React.useEffect(() => {
    const unsub = dashboardStore.subscribe(() => setState(dashboardStore.getState()));
    return () => { unsub(); };
  }, []);
  return state;
}