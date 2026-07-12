"use client";
export const dynamic = "force-dynamic";

import * as React from "react";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { toast } from "sonner";
import { Sun, Moon, Monitor, Type, Keyboard } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = React.useState(14);
  const [editorTheme, setEditorTheme] = React.useState("vs-dark");

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize your workspace preferences</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Choose your preferred theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as "light" | "dark")}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                    theme === t.id
                      ? "border-primary bg-hover text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-hover hover:text-foreground"
                  }`}
                >
                  <t.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.25 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Editor</CardTitle>
            <CardDescription>Configure the Monaco editor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Type className="h-4 w-4" /> Font Size
                </label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 w-8" onClick={() => setFontSize((s) => Math.max(10, s - 1))}>-</Button>
                  <span className="text-sm font-mono w-8 text-center">{fontSize}px</span>
                  <Button variant="outline" size="sm" className="h-8 w-8" onClick={() => setFontSize((s) => Math.min(24, s + 1))}>+</Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Monitor className="h-4 w-4" /> Editor Theme
                </label>
                <div className="flex gap-2">
                  {["vs-light", "vs-dark"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setEditorTheme(t)}
                      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                        editorTheme === t
                          ? "border-primary bg-hover text-primary"
                          : "border-border bg-card text-muted-foreground hover:bg-hover"
                      }`}
                    >
                      {t === "vs-light" ? "Light" : "Dark"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.25 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
            <CardDescription>Quick actions at your fingertips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { keys: "Ctrl + K", action: "Open global search" },
                { keys: "Ctrl + Shift + G", action: "Generate SOQL" },
                { keys: "Ctrl + Shift + C", action: "Copy output" },
                { keys: "Ctrl + Shift + D", action: "Download output" },
                { keys: "Ctrl + B", action: "Toggle sidebar" },
              ].map((shortcut) => (
                <div key={shortcut.action} className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-hover transition-colors">
                  <span className="text-sm text-foreground">{shortcut.action}</span>
                  <kbd className="inline-flex items-center rounded border border-border bg-card px-2 py-1 text-xs font-mono font-medium">
                    {shortcut.keys}
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
