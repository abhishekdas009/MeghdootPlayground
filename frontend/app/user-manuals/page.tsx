"use client";

import { useState, useEffect, useMemo } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Download,
  Trash2,
  Plus,
  FileText,
  X,
  Search,
  FileImage,
  FileSpreadsheet,
  FileBox,
  File,
  Calendar,
  UploadCloud,
  Lock,
  Eye,
  Pencil,
  Columns,
  Sparkles,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_120HZ, MODAL_MOTION } from "@/lib/motion";
import Tilt from "react-parallax-tilt";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ManualReaderDrawer, ManualItem } from "@/components/manuals/manual-reader-drawer";
import { cn } from "@/lib/utils";

const ManualThumbnail = dynamic(() => import("./manual-thumbnail"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-white/20 dark:bg-black/20 w-full h-full" />,
});

export interface Manual {
  id: string;
  title: string;
  description: string | null;
  version: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

const DEMO_MANUALS: Manual[] = [
  {
    id: "demo-bluestar-vectra-inverter",
    title: "Blue Star Inverter Split AC (Vectra Series) - Service & Fault Code Manual",
    description: "Complete technical service manual containing PCB circuit schematic, indoor/outdoor wiring diagram, refrigerant gas charging specs, and comprehensive E1-E9 error code diagnostic guide.",
    version: "New Version",
    fileUrl: "/api/user-manuals/file/demo-bluestar-vectra-inverter",
    fileName: "Blue Star_Vectra_Inverter_AC_Service_Manual.pdf",
    fileSize: 4823440,
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-bluestar-cassette-ac",
    title: "Blue Star Commercial Cassette AC - Troubleshooting & Sensor Calibration",
    description: "Technical reference manual for 2.0 to 4.0 Ton Inverter Cassettes. Includes drain pump error diagnostics, thermistor resistance charts, and dual-split wiring layouts.",
    version: "New Version",
    fileUrl: "/api/user-manuals/file/demo-bluestar-cassette-ac",
    fileName: "Blue Star_Cassette_Troubleshooting_Guide.pdf",
    fileSize: 3145728,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "demo-bluestar-window-ac",
    title: "Blue Star Fixed-Speed Window AC - Rotary Compressor & Capacitor Guide",
    description: "Wiring schematic for mechanical and electronic PCB window units, fan motor dual capacitor connection guide, and overload protector specs.",
    version: "Old Version",
    fileUrl: "/api/user-manuals/file/demo-bluestar-window-ac",
    fileName: "Blue Star_Window_AC_Wiring_Guide.pdf",
    fileSize: 1843200,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

export default function UserManualsPage() {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVersion, setFilterVersion] = useState("All");

  // In-Browser PDF Reader & Split Mode State
  const [activeManual, setActiveManual] = useState<ManualItem | null>(null);
  const [isSplitMode, setIsSplitMode] = useState(true);

  // Upload state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadVersion, setUploadVersion] = useState("New Version");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPassword, setUploadPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [manualToDelete, setManualToDelete] = useState<Manual | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Edit state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [manualToEdit, setManualToEdit] = useState<Manual | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editVersion, setEditVersion] = useState("New Version");
  const [editPassword, setEditPassword] = useState("");
  const [editing, setEditing] = useState(false);

  const fetchManuals = async () => {
    try {
      const res = await fetch("/api/user-manuals");
      const data = await res.json();
      if (data.manuals && data.manuals.length > 0) {
        setManuals(data.manuals);
      } else {
        // Fallback to verified demo manuals if DB is empty
        setManuals(DEMO_MANUALS);
      }
    } catch (e) {
      console.error(e);
      setManuals(DEMO_MANUALS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManuals();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadFile(e.dataTransfer.files[0] || null);
    }
  };

  const handleEmptyStateDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadFile(e.dataTransfer.files[0] || null);
      setIsUploadOpen(true);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadFile || !uploadPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("title", uploadTitle);
    formData.append("description", uploadDesc);
    formData.append("version", uploadVersion);
    formData.append("file", uploadFile);
    formData.append("password", uploadPassword);

    try {
      const res = await fetch("/api/user-manuals", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setIsUploadOpen(false);
        setUploadTitle("");
        setUploadDesc("");
        setUploadVersion("New Version");
        setUploadFile(null);
        setUploadPassword("");
        toast.success("Manual uploaded successfully!");
        fetchManuals();
      } else {
        try {
          const errorData = await res.json();
          toast.error(errorData.error || "Upload failed");
        } catch {
          toast.error(`Upload failed with status: ${res.status}`);
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error uploading manual";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (manual: Manual) => {
    setManualToEdit(manual);
    setEditTitle(manual.title);
    setEditDesc(manual.description || "");
    setEditVersion(manual.version || "New Version");
    setEditPassword("");
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToEdit || !editTitle || !editPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    setEditing(true);
    try {
      const res = await fetch(`/api/user-manuals/${manualToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: editPassword,
          title: editTitle,
          description: editDesc,
          version: editVersion,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsEditOpen(false);
        setManualToEdit(null);
        toast.success("Manual updated successfully!");
        fetchManuals();
      } else {
        toast.error(data.error || "Failed to update manual");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToDelete || !deletePassword) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/user-manuals/${manualToDelete.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      if (res.ok) {
        setIsDeleteOpen(false);
        if (activeManual?.id === manualToDelete.id) {
          setActiveManual(null);
        }
        setManualToDelete(null);
        setDeletePassword("");
        toast.success("Manual deleted successfully");
        fetchManuals();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Delete failed");
      }
    } catch {
      toast.error("Error deleting manual");
    } finally {
      setDeleting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const filteredManuals = useMemo(() => {
    return manuals.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesVersion = filterVersion === "All" || m.version === filterVersion;
      return matchesSearch && matchesVersion;
    });
  }, [manuals, searchQuery, filterVersion]);

  return (
    <div className="flex h-screen flex-col bg-transparent overflow-hidden">
      {/* ── Top Header Area ─────────────────────────────────────────────────────── */}
      <div className="relative flex shrink-0 flex-col gap-4 border-b border-slate-200/70 dark:border-white/[0.08] bg-white/55 dark:bg-[#05070e]/65 px-6 py-4 backdrop-blur-md xl:flex-row xl:items-center xl:justify-between z-20">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px glass-shimmer-line opacity-60" />
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-blue-700 text-white shadow-[0_6px_18px_rgba(2,132,199,0.35)] ring-1 ring-white/25">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              <span>User Manual Library</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 dark:from-sky-300 dark:to-blue-400">
                &amp; PDF Reader
              </span>
              {activeManual && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-500/30 uppercase tracking-wide whitespace-nowrap">
                  Split Reader Active
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Browse technical service manuals with in-browser split PDF reader and instant keyword jumping
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full xl:w-auto shrink-0" suppressHydrationWarning>
          <Select value={filterVersion} onValueChange={setFilterVersion}>
            <SelectTrigger className="w-[150px] shrink-0 h-9 bg-white/65 dark:bg-white/[0.05] backdrop-blur-md border-slate-200/80 dark:border-white/[0.1] text-slate-900 dark:text-slate-100 shadow-xs text-xs font-bold rounded-xl">
              <SelectValue placeholder="All Versions" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 dark:bg-[#0b0e18]/95 backdrop-blur-md border-slate-200/80 dark:border-white/[0.1]">
              <SelectItem value="All">All Versions</SelectItem>
              <SelectItem value="New Version">New Version</SelectItem>
              <SelectItem value="Old Version">Old Version</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[200px] sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search manuals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 text-xs font-semibold bg-white/65 dark:bg-white/[0.05] backdrop-blur-md border-slate-200/80 dark:border-white/[0.1] text-slate-900 dark:text-slate-100 shadow-xs focus-visible:ring-sky-500/30 rounded-xl"
            />
          </div>

          <Button
            size="sm"
            className="h-9 gap-1.5 bg-gradient-to-r from-sky-400 via-blue-600 to-blue-700 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-blue-500/25 border border-sky-400/30 transition-all shrink-0 rounded-xl"
            onClick={() => setIsUploadOpen(true)}
          >
            <UploadCloud className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Manual</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        </div>
      </div>

      {/* ── Main Body with In-Browser Split Reader Layout ─────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Manuals Library List / Grid */}
        <div
          className={cn(
            "h-full overflow-y-auto p-6 transition-all duration-300 custom-scrollbar",
            activeManual && isSplitMode
              ? "hidden md:block md:w-[42%] lg:w-[38%] xl:w-[35%] shrink-0 border-r border-border/80"
              : "w-full"
          )}
        >
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500/20 border-t-sky-500" />
                <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse text-sm">
                  Loading verified manuals...
                </p>
              </div>
            </div>
          ) : filteredManuals.length === 0 ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleEmptyStateDrop}
              className="flex h-[55vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-white/[0.12] bg-slate-50/50 dark:bg-[#0b0c10]/40 px-6 py-12 text-center shadow-xs"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 mb-3 shadow-xs">
                <Search className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No manuals found</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-sm">
                {searchQuery
                  ? `No manuals matching "${searchQuery}". Try adjusting your keywords.`
                  : "Your documentation repository is empty."}
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-4.5",
                activeManual && isSplitMode
                  ? "grid-cols-1"
                  : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              )}
            >
              {filteredManuals.map((manual, i) => {
                const isCurrentActive = activeManual?.id === manual.id;
                return (
                  <motion.div
                    key={manual.id}
                    initial={{ opacity: 0, y: 14, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.28, delay: Math.min(i * 0.03, 0.24), ease: EASE_120HZ }}
                    className="h-full"
                  >
                    <Tilt
                      tiltMaxAngleX={3.5}
                      tiltMaxAngleY={3.5}
                      glareEnable={true}
                      glareMaxOpacity={0.08}
                      glareColor="white"
                      glarePosition="all"
                      glareBorderRadius="1.25rem"
                      scale={1.015}
                      transitionSpeed={1500}
                      className={cn(
                        "app-card group relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-200",
                        isCurrentActive
                          ? "!border-sky-500/80 ring-2 ring-sky-500/35 shadow-[0_12px_36px_rgba(14,165,233,0.22)]"
                          : ""
                      )}
                    >
                      {/* Top Specular Rim */}
                      <div className="absolute inset-x-0 top-0 h-px glass-shimmer-line pointer-events-none z-20" />

                      {/* Thumbnail Area - Clickable to Read */}
                      <div
                        onClick={() => setActiveManual(manual)}
                        className="w-full aspect-video bg-slate-100/70 dark:bg-[#060810]/70 overflow-hidden relative flex items-center justify-center border-b border-slate-200/60 dark:border-white/[0.06] shrink-0 cursor-pointer group-hover:opacity-95"
                      >
                        <ManualThumbnail manual={manual} />
                        <div className="absolute inset-0 bg-blue-950/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[2px]">
                          <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg border border-white/25 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
                            <BookOpen className="h-3.5 w-3.5" />
                            Open In Split Reader
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex-1 flex flex-col bg-transparent relative z-10">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3
                              onClick={() => setActiveManual(manual)}
                              className="font-bold text-sm leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-sky-300 transition-colors cursor-pointer"
                              title={manual.title}
                            >
                              {manual.title}
                            </h3>
                            {manual.version && (
                              <span
                                className={`shrink-0 text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                  manual.version === "New Version"
                                    ? "bg-blue-500/10 text-blue-700 dark:bg-sky-500/15 dark:text-sky-300 border-blue-500/25 dark:border-sky-400/30"
                                    : "bg-slate-500/10 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300 border-slate-300/60 dark:border-white/15"
                                }`}
                              >
                                {manual.version}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                            {manual.description || (
                              <span className="italic opacity-50">No description provided.</span>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-blue-500/80 dark:text-sky-400/80" />
                            <span>{formatDate(manual.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="w-1 h-1 rounded-full bg-blue-400/60" />
                            <span>{formatSize(manual.fileSize)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions Strip */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.03] backdrop-blur-md p-1.5 px-3 relative z-10 shrink-0">
                        {/* 1-Click Quick Read Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setActiveManual(manual)}
                          className={cn(
                            "h-7 px-2.5 rounded-lg text-xs font-bold gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0",
                            isCurrentActive
                              ? "bg-sky-500/20 text-sky-700 dark:text-sky-300"
                              : "text-blue-600 dark:text-sky-400 hover:bg-sky-500/10"
                          )}
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>{isCurrentActive ? "Reading..." : "Read"}</span>
                        </Button>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={manual.fileUrl}
                            download
                            className={`${buttonVariants({
                              variant: "ghost",
                              size: "icon",
                            })} h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 dark:text-slate-400 dark:hover:text-sky-300 dark:hover:bg-sky-500/10 transition-colors rounded-lg`}
                            title="Download File"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 dark:text-slate-400 dark:hover:text-sky-300 dark:hover:bg-sky-500/10 transition-colors rounded-lg"
                            title="Edit Info"
                            onClick={() => openEditModal(manual)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          {!manual.id.startsWith("demo") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors rounded-lg"
                              title="Delete Manual"
                              onClick={() => {
                                setManualToDelete(manual);
                                setIsDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Tilt>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: In-Browser Split PDF Reader & In-Document Search Drawer */}
        {activeManual && (
          <ManualReaderDrawer
            manual={activeManual}
            onClose={() => setActiveManual(null)}
            isSplitMode={isSplitMode}
            onToggleSplitMode={() => setIsSplitMode(!isSplitMode)}
          />
        )}
      </div>

      {/* ── Upload Modal ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
      {isUploadOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        >
          <motion.div
            {...MODAL_MOTION}
            className="w-full max-w-lg rounded-3xl bg-white/90 dark:bg-[#0b0e18]/90 backdrop-blur-3xl shadow-2xl border border-slate-200/80 dark:border-white/[0.12] overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] px-6 py-4 bg-slate-50/70 dark:bg-[#06070a]/90">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Upload New Manual</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Add documentation to the verified repository
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white"
                onClick={() => setIsUploadOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleUpload} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="title" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Manual Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="title"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Blue Star Inverter AC Service Manual"
                  className="bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-sky-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="description" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Provide an overview of contents, models covered, or error codes..."
                  className="resize-none min-h-[85px] bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-sky-500/30 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Version Tier</label>
                <Select value={uploadVersion} onValueChange={setUploadVersion}>
                  <SelectTrigger className="w-full bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Version">New Version</SelectItem>
                    <SelectItem value="Old Version">Old Version</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Document File <span className="text-rose-500">*</span>
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                    isDragOver
                      ? "border-sky-500 bg-sky-50/50 dark:bg-sky-500/10"
                      : "border-slate-200 dark:border-white/[0.1] hover:border-sky-500/40 bg-slate-50/40 dark:bg-[#06070a]"
                  }`}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  <UploadCloud
                    className={`h-7 w-7 mb-2 ${
                      isDragOver ? "text-sky-500" : "text-slate-400 dark:text-slate-500"
                    }`}
                  />
                  {uploadFile ? (
                    <div className="flex flex-col items-center text-center px-4">
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400 truncate max-w-xs">
                        {uploadFile.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB • Click or drop new file to replace
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center px-4">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Click to choose or drag & drop
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        PDF, DOCX, XLSX, images up to 50MB
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Authorization Password <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={uploadPassword}
                  onChange={(e) => setUploadPassword(e.target.value)}
                  placeholder="Enter administrator passcode"
                  className="bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-mono text-sm focus-visible:ring-sky-500/30"
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <Button type="button" variant="outline" className="text-xs font-medium" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploading}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-md shadow-sky-600/20 text-xs min-w-[100px]"
                >
                  {uploading ? "Uploading..." : "Save Manual"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ── Edit Modal ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
      {isEditOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        >
          <motion.div
            {...MODAL_MOTION}
            className="w-full max-w-lg rounded-3xl bg-white/90 dark:bg-[#0b0e18]/90 backdrop-blur-3xl shadow-2xl border border-slate-200/80 dark:border-white/[0.12] overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] px-6 py-4 bg-slate-50/70 dark:bg-[#06070a]/90">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Edit Manual Details</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Update metadata and classification</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white"
                onClick={() => setIsEditOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleEdit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="edit-title" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Manual Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="edit-title"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus-visible:ring-sky-500/30"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-desc" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <Textarea
                  id="edit-desc"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="resize-none min-h-[85px] bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Version Tier</label>
                <Select value={editVersion} onValueChange={setEditVersion}>
                  <SelectTrigger className="w-full bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Version">New Version</SelectItem>
                    <SelectItem value="Old Version">Old Version</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 pt-1">
                <label
                  htmlFor="edit-password"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Authorization Password <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="edit-password"
                  type="password"
                  required
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter administrator passcode"
                  className="bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 font-mono text-sm"
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <Button type="button" variant="outline" className="text-xs font-medium" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editing}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-md shadow-sky-600/20 text-xs min-w-[100px]"
                >
                  {editing ? "Saving..." : "Update Manual"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
      {isDeleteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        >
          <motion.div
            {...MODAL_MOTION}
            className="w-full max-w-md rounded-3xl bg-white/90 dark:bg-[#0b0e18]/90 backdrop-blur-3xl shadow-2xl border border-rose-500/30 overflow-hidden"
          >
            <div className="bg-rose-500/10 dark:bg-rose-950/30 px-6 py-5 flex items-start gap-3.5 border-b border-rose-200 dark:border-rose-900/40">
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-800/40">
                <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="pt-0.5">
                <h2 className="text-base font-bold text-rose-700 dark:text-rose-400">Permanently Delete Manual?</h2>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <form onSubmit={handleDelete} className="p-6 space-y-4">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">&quot;{manualToDelete?.title}&quot;</strong>?
              </p>

              <div className="space-y-1.5">
                <label
                  htmlFor="delete-password"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Authorization Password <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="delete-password"
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter administrator passcode"
                  className="bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 font-mono text-sm focus-visible:ring-rose-500/30"
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <Button type="button" variant="outline" className="text-xs font-medium" onClick={() => setIsDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={deleting}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-md shadow-rose-600/20 text-xs min-w-[100px]"
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
