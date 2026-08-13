"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonTreeProps {
  data: any;
  name?: string;
  isLast?: boolean;
  level?: number;
}

export const JsonTree: React.FC<JsonTreeProps> = ({ data, name, isLast = true, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);
  const isEmpty = isObject && Object.keys(data).length === 0;

  if (!isObject) {
    let valueColor = "text-emerald-500 dark:text-emerald-400"; // string
    if (typeof data === 'number') valueColor = "text-blue-500 dark:text-blue-400";
    else if (typeof data === 'boolean') valueColor = "text-rose-500 dark:text-rose-400";
    else if (data === null) valueColor = "text-slate-500 dark:text-slate-400";

    return (
      <div className="flex font-mono text-xs leading-relaxed group">
        {name && <span className="text-sky-500 dark:text-sky-400 font-bold mr-1 group-hover:text-sky-400 dark:group-hover:text-sky-300">"{name}":</span>}
        <span className={valueColor} style={{ wordBreak: 'break-all' }}>
          {typeof data === 'string' ? `"${data}"` : String(data)}
        </span>
        {!isLast && <span className="text-slate-400 dark:text-slate-500">,</span>}
      </div>
    );
  }

  const keys = Object.keys(data);
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  return (
    <div className="font-mono text-xs leading-relaxed flex flex-col relative group/node">
      <div 
        className={cn(
          "flex items-center cursor-pointer select-none hover:bg-slate-200/50 dark:hover:bg-white/5 rounded-md -ml-5 px-1 py-0.5",
          isEmpty && "cursor-default hover:bg-transparent dark:hover:bg-transparent"
        )}
        onClick={() => !isEmpty && setIsExpanded(!isExpanded)}
      >
        {!isEmpty ? (
          <span className="w-4 h-4 flex items-center justify-center mr-1 text-slate-400 group-hover/node:text-blue-500 dark:group-hover/node:text-blue-400 transition-colors">
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        ) : (
          <span className="w-4 h-4 mr-1" />
        )}
        
        {name && <span className="text-sky-500 dark:text-sky-400 font-bold mr-1 group-hover/node:text-sky-400 dark:group-hover/node:text-sky-300">"{name}":</span>}
        <span className="text-slate-600 dark:text-slate-400 font-bold">{openBracket}</span>
        
        {!isExpanded && !isEmpty && (
          <>
            <span className="text-slate-500 mx-2 italic bg-slate-200 dark:bg-slate-800 px-1.5 rounded text-[10px]">
              {keys.length} item{keys.length !== 1 && 's'}
            </span>
            <span className="text-slate-600 dark:text-slate-400 font-bold">{closeBracket}</span>
            {!isLast && <span className="text-slate-400 dark:text-slate-500">,</span>}
          </>
        )}
      </div>

      {isExpanded && !isEmpty && (
        <div className="relative ml-4">
          {/* Subtle connecting guideline that highlights on hover */}
          <div className="absolute left-[-11px] top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 group-hover/node:bg-blue-400/50 transition-colors duration-300" />
          
          <div className="flex flex-col py-1">
            {keys.map((key, index) => (
              <div key={key} className="relative">
                {/* Horizontal connector line */}
                <div className="absolute left-[-11px] top-[10px] w-2 h-px bg-slate-200 dark:bg-slate-800 group-hover/node:bg-blue-400/50 transition-colors duration-300" />
                <div className="pl-1">
                    <JsonTree 
                        data={data[key as keyof typeof data]} 
                        name={isArray ? undefined : key} 
                        isLast={index === keys.length - 1} 
                        level={level + 1} 
                    />
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex -ml-4">
            <span className="w-4 mr-1" />
            <span className="text-slate-600 dark:text-slate-400 font-bold">{closeBracket}</span>
            {!isLast && <span className="text-slate-400 dark:text-slate-500">,</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export const JsonViewer = ({ data, className }: { data: any, className?: string }) => {
  let parsedData = data;
  if (typeof data === 'string') {
    try { parsedData = JSON.parse(data); } catch (e) { parsedData = data; }
  }
  
  return (
    <div className={cn("p-5 overflow-auto max-h-[320px] min-h-[180px] w-full text-left bg-transparent no-scrollbar relative flex-1", className)}>
      {typeof parsedData === 'object' && parsedData !== null ? (
        <div className="pl-2">
          <JsonTree data={parsedData} />
        </div>
      ) : (
        <pre className="font-mono text-xs leading-relaxed text-slate-800 dark:text-sky-200 min-h-0 whitespace-pre-wrap break-words selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-100">
          {typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData, null, 2)}
        </pre>
      )}
    </div>
  );
};
