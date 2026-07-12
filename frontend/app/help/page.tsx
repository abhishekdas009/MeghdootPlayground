"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MessageCircle, Keyboard, ExternalLink } from "lucide-react";

const faqs = [
  { q: "Does this connect to Salesforce?", a: "No. MeghdootPlayground never connects to Salesforce. It only generates SOQL text for you to copy and paste into your Workbench or Developer Console." },
  { q: "How do I create a custom template?", a: "Go to Template Manager, click New Template, and use {{tickets}} as the variable for ticket numbers. The generator will replace it automatically." },
  { q: "Is my data stored securely?", a: "All data is stored locally in your browser and the local SQLite database. No data leaves your machine." },
  { q: "Can I export my templates?", a: "Yes. Template Manager supports both JSON import and export so you can share templates with your team." },
  { q: "What Excel formats are supported?", a: "Excel Automation supports .xlsx and .xls files. Operations are performed in-memory and the cleaned file is downloaded immediately." },
];

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Help & Documentation</h1>
        <p className="text-sm text-muted-foreground">Everything you need to get the most out of MeghdootPlayground</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, title: "Documentation", desc: "Learn how each feature works", color: "primary" },
          { icon: MessageCircle, title: "FAQ", desc: "Common questions answered", color: "success" },
          { icon: Keyboard, title: "Shortcuts", desc: "Work faster with hotkeys", color: "warning" },
        ].map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover:shadow-card-hover transition-shadow h-full">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${card.color}/10`}>
                  <card.icon className={`h-5 w-5 text-${card.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{card.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
            <CardDescription>Quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-lg border border-border p-4 hover:bg-hover transition-colors">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0 mt-0.5 text-[10px]">Q{i + 1}</Badge>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{faq.q}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Keyboard Shortcuts Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { keys: "Ctrl + K", action: "Global search" },
                { keys: "Ctrl + Shift + G", action: "Generate SOQL" },
                { keys: "Ctrl + Shift + C", action: "Copy output" },
                { keys: "Ctrl + Shift + D", action: "Download output" },
                { keys: "Ctrl + B", action: "Toggle sidebar" },
                { keys: "Ctrl + /", action: "Open help" },
              ].map((s) => (
                <div key={s.action} className="flex items-center justify-between rounded-md border border-border p-3">
                  <span className="text-sm text-foreground">{s.action}</span>
                  <kbd className="inline-flex items-center rounded border border-border bg-card px-2 py-1 text-xs font-mono font-medium">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
