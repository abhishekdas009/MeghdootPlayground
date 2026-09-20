"use client";

import { FileText, FileSpreadsheet, FileImage, FileBox, File } from "lucide-react";

export const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FileText className="h-6 w-6 text-rose-500" />;
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return <FileSpreadsheet className="h-6 w-6 text-emerald-500" />;
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) return <FileImage className="h-6 w-6 text-blue-500" />;
  if (['zip', 'rar', 'tar', 'gz'].includes(ext || '')) return <FileBox className="h-6 w-6 text-amber-500" />;
  return <File className="h-6 w-6 text-indigo-500" />;
};

export default function ManualThumbnail({ manual }: { manual: any }) {
  const ext = manual.fileName.split('.').pop()?.toLowerCase();
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '');
  const isPdf = ext === 'pdf';

  if (isImage) {
    return <img src={manual.fileUrl} alt={manual.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />;
  }

  if (isPdf) {
    return (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none group-hover:scale-105 transition-transform duration-500 bg-white dark:bg-slate-900">
        <div className="absolute inset-0 z-10 bg-transparent" /> {/* Overlay to trap all clicks just in case */}
        <iframe 
          src={`${manual.fileUrl}#page=1&view=FitH&scrollbar=0&toolbar=0&navpanes=0`}
          className="absolute -top-[10px] left-[-24px] w-[calc(100%+48px)] h-[calc(100%+24px)] border-none" 
          tabIndex={-1}
          title={manual.title}
          scrolling="no"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 group-hover:scale-110 transition-transform duration-500">
      <div className="scale-150">
        {getFileIcon(manual.fileName)}
      </div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{ext || 'FILE'}</span>
    </div>
  );
}
