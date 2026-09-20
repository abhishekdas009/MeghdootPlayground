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
      <div className="flex shrink-0 flex-col gap-4 border-b border-white/10 bg-transparent px-6 py-6 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:from-blue-500/20 dark:to-indigo-500/20 dark:text-indigo-400 border border-indigo-500/20">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              User Manual Library
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browse, search, and download system user manuals
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto" suppressHydrationWarning>
          <Select value={filterVersion} onValueChange={setFilterVersion}>
            <SelectTrigger className="w-[180px] h-10 bg-white/5 dark:bg-black/20 border-white/10 text-foreground focus:ring-indigo-500/50">
              <SelectValue placeholder="All Versions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Versions</SelectItem>
              <SelectItem value="New Version">New Version</SelectItem>
              <SelectItem value="Old Version">Old Version</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search manuals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 dark:bg-black/20 border-white/10 focus-visible:ring-indigo-500/50"
            />
          </div>
          <Button 
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all" 
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
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-600" />
              <p className="text-muted-foreground font-medium animate-pulse">Loading manuals...</p>
            </div>
          </div>
        ) : filteredManuals.length === 0 ? (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleEmptyStateDrop}
            className="flex h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-transparent px-6 py-12 text-center shadow-sm transition-colors hover:border-indigo-500/50 hover:bg-white/5 dark:hover:bg-indigo-500/5"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50/10 dark:bg-indigo-950/50 mb-4">
              <Search className="h-8 w-8 text-indigo-400 dark:text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No manuals found</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                {searchQuery 
                  ? `We couldn't find any manuals matching "${searchQuery}". Try adjusting your search.` 
                  : "Your library is empty. Click the button below or drag and drop a manual anywhere here to upload."}
              </p>
            {!searchQuery && (
              <Button 
                className="mt-6 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" 
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
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                className="h-full"
              >
                <Tilt
                  tiltMaxAngleX={5}
                  tiltMaxAngleY={5}
                  glareEnable={true}
                  glareMaxOpacity={0.15}
                  glareColor="white"
                  glarePosition="all"
                  glareBorderRadius="1rem"
                  scale={1.02}
                  transitionSpeed={2000}
                  className="group relative flex flex-col h-full rounded-2xl border border-slate-200/50 dark:border-white/10 bg-white/45 dark:bg-slate-950/45 backdrop-blur-xl p-0 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 overflow-hidden"
                >
                  {/* Thumbnail Area */}
                  <div className="w-full aspect-video bg-white/20 dark:bg-black/20 overflow-hidden relative flex items-center justify-center border-b border-slate-200/50 dark:border-white/10 shrink-0">
                    <ManualThumbnail manual={manual} />
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col bg-white/10 dark:bg-transparent relative z-10">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 
                          className="font-bold text-base leading-tight text-foreground line-clamp-2" 
                          title={manual.title}
                        >
                          {manual.title}
                        </h3>
                        {manual.version && (
                          <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${manual.version === 'New Version' ? 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300'}`}>
                            {manual.version}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                        {manual.description || <span className="italic opacity-50">No description provided.</span>}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(manual.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                        <span>{formatSize(manual.fileSize)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-around border-t border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-black/20 p-2 relative z-10 shrink-0">
                    <a
                      href={manual.fileUrl}
                      download
                      className={`${buttonVariants({ variant: "ghost", size: "icon" })} h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 transition-colors`}
                      title="Download"
                    >
                      <Download className="h-[18px] w-[18px]" />
                    </a>
                    <a
                      href={manual.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${buttonVariants({ variant: "ghost", size: "icon" })} h-9 w-9 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 transition-colors`}
                      title="Preview"
                    >
                      <Eye className="h-[18px] w-[18px]" />
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 transition-colors"
                      title="Edit Info"
                      onClick={() => openEditModal(manual)}
                    >
                      <Pencil className="h-[18px] w-[18px]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                      title="Delete Manual"
                      onClick={() => {
                        setManualToDelete(manual);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-[18px] w-[18px]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-card shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-border/40 px-6 py-4 bg-muted/10">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-foreground">Upload New Manual</h2>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted" onClick={() => setIsUploadOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleUpload} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="title" className="text-sm font-medium text-foreground">Manual Title <span className="text-red-500">*</span></label>
                <Input
                  id="title"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Sales Workflow Guide 2026"
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="description" className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  id="description"
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Provide a brief overview of what this manual covers..."
                  className="resize-none min-h-[100px] bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Version</label>
                <Select value={uploadVersion} onValueChange={setUploadVersion}>
                  <SelectTrigger className="w-full bg-background text-foreground">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Version">New Version</SelectItem>
                    <SelectItem value="Old Version">Old Version</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Select File <span className="text-red-500">*</span></label>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed transition-colors ${isDragOver ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 bg-background'} cursor-pointer`}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                  <UploadCloud className={`h-8 w-8 mb-2 ${isDragOver ? 'text-indigo-500' : 'text-muted-foreground'}`} />
                  {uploadFile ? (
                    <div className="flex flex-col items-center text-center">
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{uploadFile.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB • Click or drag to replace</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <span className="text-sm font-medium text-foreground">Click to upload or drag and drop</span>
                      <span className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX up to 50MB</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Upload Authorization <span className="text-red-500">*</span>
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={uploadPassword}
                  onChange={(e) => setUploadPassword(e.target.value)}
                  placeholder="Enter system admin password"
                  className="bg-background font-mono"
                />
                <p className="text-xs text-muted-foreground">Requires administrator privileges to upload to the library.</p>
              </div>
            </form>
            
            <div className="border-t border-border/40 p-4 px-6 bg-muted/10 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]" disabled={uploading} onClick={handleUpload}>
                {uploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-card shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-border/40 px-6 py-4 bg-muted/10">
              <div className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-foreground">Edit Manual Info</h2>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted" onClick={() => setIsEditOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleEdit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="edit-title" className="text-sm font-medium text-foreground">Manual Title <span className="text-red-500">*</span></label>
                <Input
                  id="edit-title"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g., Sales Workflow Guide 2026"
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="edit-description" className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  id="edit-description"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Provide a brief overview of what this manual covers..."
                  className="resize-none min-h-[100px] bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Version</label>
                <Select value={editVersion} onValueChange={setEditVersion}>
                  <SelectTrigger className="w-full bg-background text-foreground">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Version">New Version</SelectItem>
                    <SelectItem value="Old Version">Old Version</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="edit-password" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Authorization Password <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-password"
                  type="password"
                  required
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter system admin password"
                  className="bg-background font-mono text-sm"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Requires administrator privileges to modify the library.</p>
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/40">
                <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={editing} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]">
                  {editing ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2"><Pencil className="h-4 w-4" /> Save Changes</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-card shadow-2xl border border-red-500/20 overflow-hidden">
            <div className="bg-red-50 dark:bg-red-950/20 px-6 py-5 flex items-start gap-4 border-b border-red-100 dark:border-red-900/30">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="pt-1">
                <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">Delete Manual</h2>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">This action cannot be undone.</p>
              </div>
            </div>
            
            <form onSubmit={handleDelete} className="p-6 space-y-5">
              <p className="text-sm text-foreground">
                Are you sure you want to permanently delete <strong>&quot;{manualToDelete?.title}&quot;</strong>?
              </p>
              
              <div className="space-y-1.5">
                <label htmlFor="delete-password" className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Admin Password <span className="text-red-500">*</span>
                </label>
                <Input
                  id="delete-password"
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter password to authorize deletion"
                  className="font-mono"
                />
              </div>
              
              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="danger" disabled={deleting} className="min-w-[100px]">
                  {deleting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Deleting
                    </div>
                  ) : "Delete"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
