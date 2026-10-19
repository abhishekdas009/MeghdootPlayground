"use client";

import { useState, useEffect, useMemo } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, Download, Trash2, Plus, 
  FileText, X, Search, FileImage, 
  FileSpreadsheet, FileBox, File, Calendar,
  UploadCloud, Lock, Eye, Pencil
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ManualThumbnail = dynamic(() => import('./manual-thumbnail'), { 
  ssr: false, 
  loading: () => <div className="animate-pulse bg-white/20 dark:bg-black/20 w-full h-full" /> 
});

interface Manual {
  id: string;
  title: string;
  description: string | null;
  version: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

export default function UserManualsPage() {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVersion, setFilterVersion] = useState("All");

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
      if (data.manuals) setManuals(data.manuals);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch manuals");
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
        } catch (jsonError) {
          toast.error(`Upload failed with status: ${res.status}`);
        }
      }
    } catch (e: any) {
      toast.error(`Error uploading manual: ${e.message}`);
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
          version: editVersion
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
    } catch (error) {
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
        setManualToDelete(null);
        setDeletePassword("");
        toast.success("Manual deleted successfully");
        fetchManuals();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Delete failed");
      }
    } catch (e) {
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
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="h-6 w-6 text-rose-500" />;
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="h-6 w-6 text-emerald-500" />;
    if (['png', 'jpg', 'jpeg', 'gif'].includes(ext || '')) return <FileImage className="h-6 w-6 text-blue-500" />;
    if (['zip', 'rar', 'tar', 'gz'].includes(ext || '')) return <FileBox className="h-6 w-6 text-amber-500" />;
    return <File className="h-6 w-6 text-indigo-500" />;
  };

  const filteredManuals = useMemo(() => {
    return manuals.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesVersion = filterVersion === "All" || m.version === filterVersion;
      return matchesSearch && matchesVersion;
    });
  }, [manuals, searchQuery, filterVersion]);

  return (
    <div className="flex h-full flex-col bg-transparent">
      {/* Header Area */}
      <div className="flex shrink-0 flex-col gap-4 border-b border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#030305]/80 px-6 py-6 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 shadow-sm">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              User Manual Library
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Browse, search, and download verified system manuals and technical reference guides
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto" suppressHydrationWarning>
          <Select value={filterVersion} onValueChange={setFilterVersion}>
            <SelectTrigger className="w-[170px] h-10 bg-white dark:bg-[#0b0c10] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 shadow-sm focus:ring-sky-500/30">
              <SelectValue placeholder="All Versions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Versions</SelectItem>
              <SelectItem value="New Version">New Version</SelectItem>
              <SelectItem value="Old Version">Old Version</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search manuals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-[#0b0c10] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 shadow-sm focus-visible:ring-sky-500/30"
            />
          </div>
          <Button 
            className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium shadow-md shadow-sky-500/20 border border-sky-400/30 transition-all shrink-0" 
            onClick={() => setIsUploadOpen(true)}
          >
            <UploadCloud className="h-4 w-4" /> 
            <span className="hidden sm:inline">Upload Manual</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6 bg-transparent">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500/20 border-t-sky-500" />
              <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse text-sm">Loading verified manuals...</p>
            </div>
          </div>
        ) : filteredManuals.length === 0 ? (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleEmptyStateDrop}
            className="flex h-[55vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-white/[0.12] bg-slate-50/50 dark:bg-[#0b0c10]/40 px-6 py-12 text-center shadow-sm transition-all hover:border-sky-500/50 hover:bg-slate-50/80 dark:hover:bg-[#0b0c10]/80"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 mb-4 shadow-sm">
              <Search className="h-7 w-7 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No manuals found</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-sm">
              {searchQuery 
                ? `We couldn't find any manuals matching "${searchQuery}". Try adjusting your keywords or clearing the filter.` 
                : "Your documentation repository is empty. Drop files here or click below to upload your first manual."}
            </p>
            {!searchQuery && (
              <Button 
                className="mt-6 gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium shadow-md shadow-sky-500/20 border border-sky-400/30" 
                onClick={() => setIsUploadOpen(true)}
              >
                <Plus className="h-4 w-4" /> Upload First Manual
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filteredManuals.map((manual, i) => (
              <motion.div
                key={manual.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: "easeOut" }}
                className="h-full"
              >
                <Tilt
                  tiltMaxAngleX={4}
                  tiltMaxAngleY={4}
                  glareEnable={true}
                  glareMaxOpacity={0.08}
                  glareColor="white"
                  glarePosition="all"
                  glareBorderRadius="1rem"
                  scale={1.01}
                  transitionSpeed={2000}
                  className="group relative flex flex-col h-full rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0c10] shadow-sm hover:shadow-xl hover:shadow-sky-500/5 dark:hover:shadow-sky-500/10 hover:border-sky-500/30 dark:hover:border-sky-500/30 transition-all duration-300 overflow-hidden"
                >
                  {/* Top Specular Rim */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                  {/* Thumbnail Area */}
                  <div className="w-full aspect-video bg-slate-100 dark:bg-[#06070a] overflow-hidden relative flex items-center justify-center border-b border-slate-200 dark:border-white/[0.06] shrink-0">
                    <ManualThumbnail manual={manual} />
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col bg-white dark:bg-[#0b0c10] relative z-10">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 
                          className="font-bold text-sm leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" 
                          title={manual.title}
                        >
                          {manual.title}
                        </h3>
                        {manual.version && (
                          <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            manual.version === 'New Version' 
                              ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border-sky-200 dark:border-sky-500/30' 
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                          }`}>
                            {manual.version}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {manual.description || <span className="italic opacity-50">No description provided.</span>}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(manual.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span>{formatSize(manual.fileSize)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-around border-t border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#07080b] p-1.5 relative z-10 shrink-0">
                    <a
                      href={manual.fileUrl}
                      download
                      className={`${buttonVariants({ variant: "ghost", size: "icon" })} h-8 w-8 text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-sky-500/10 transition-colors`}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <a
                      href={manual.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${buttonVariants({ variant: "ghost", size: "icon" })} h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 transition-colors`}
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 transition-colors"
                      title="Edit Info"
                      onClick={() => openEditModal(manual)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
                      title="Delete Manual"
                      onClick={() => {
                        setManualToDelete(manual);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Tilt>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0b0c10] shadow-2xl border border-slate-200 dark:border-white/[0.1] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] px-6 py-4 bg-slate-50/70 dark:bg-[#06070a]/90">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Upload New Manual</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Add documentation to the verified repository</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]" onClick={() => setIsUploadOpen(false)}>
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
                  placeholder="e.g., Salesforce Service Console Standard Procedures"
                  className="bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-sky-500/30"
                />
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="description" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <Textarea
                  id="description"
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Provide an overview of contents, audience, or operational scope..."
                  className="resize-none min-h-[90px] bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-sky-500/30 text-sm"
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
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-500/10' 
                      : 'border-slate-200 dark:border-white/[0.1] hover:border-sky-500/40 bg-slate-50/40 dark:bg-[#06070a]'
                  }`}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  <UploadCloud className={`h-7 w-7 mb-2 ${isDragOver ? 'text-sky-500' : 'text-slate-400 dark:text-slate-500'}`} />
                  {uploadFile ? (
                    <div className="flex flex-col items-center text-center px-4">
                      <span className="text-xs font-bold text-sky-600 dark:text-sky-400 truncate max-w-xs">{uploadFile.name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB • Click or drop new file to replace</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center px-4">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Click to choose or drag & drop</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">PDF, DOCX, XLSX, images up to 50MB</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-1.5 pt-1">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
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
                  className="bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 font-mono text-sm focus-visible:ring-sky-500/30"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Requires administrator privileges to publish to the manual library.</p>
              </div>
            </form>
            
            <div className="border-t border-slate-100 dark:border-white/[0.06] p-4 px-6 bg-slate-50/70 dark:bg-[#06070a]/90 flex justify-end gap-2.5">
              <Button type="button" variant="outline" className="text-xs font-medium" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium shadow-md shadow-sky-500/20 border border-sky-400/30 text-xs min-w-[120px]" 
                disabled={uploading} 
                onClick={handleUpload}
              >
                {uploading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-3.5 w-3.5" />
                    Upload Manual
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0b0c10] shadow-2xl border border-slate-200 dark:border-white/[0.1] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] px-6 py-4 bg-slate-50/70 dark:bg-[#06070a]/90">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Edit Manual Details</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Update title, version metadata, or description</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]" onClick={() => setIsEditOpen(false)}>
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
                  placeholder="e.g., Salesforce Service Console Guide"
                  className="bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus-visible:ring-sky-500/30"
                />
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="edit-description" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <Textarea
                  id="edit-description"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Provide a brief overview of what this manual covers..."
                  className="resize-none min-h-[90px] bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 focus-visible:ring-sky-500/30 text-sm"
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
                <label htmlFor="edit-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
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
                  className="bg-slate-50/50 dark:bg-[#06070a] border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-slate-100 font-mono text-sm focus-visible:ring-sky-500/30"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Requires administrator privileges to edit library entries.</p>
              </div>
              
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-white/[0.06]">
                <Button type="button" variant="outline" className="text-xs font-medium" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button 
                  type="submit" 
                  disabled={editing} 
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium shadow-md shadow-sky-500/20 border border-sky-400/30 text-xs min-w-[110px]"
                >
                  {editing ? (
                    <span className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5"><Pencil className="h-3.5 w-3.5" /> Save Changes</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0b0c10] shadow-2xl border border-rose-500/30 overflow-hidden">
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
                Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">&quot;{manualToDelete?.title}&quot;</strong> from the library?
              </p>
              
              <div className="space-y-1.5">
                <label htmlFor="delete-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
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
                  {deleting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Deleting...
                    </div>
                  ) : "Confirm Delete"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
