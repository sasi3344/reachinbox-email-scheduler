import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { parseEmailsFromText, ParseResult } from '../../utils/csv-parser';

interface FileUploaderProps {
  onEmailsDetected: (emails: string[], rawText?: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onEmailsDetected }) => {
  const [dragActive, setDragActive] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processText = (text: string, name: string) => {
    setFileName(name);
    const result = parseEmailsFromText(text);
    setParseResult(result);
    onEmailsDetected(result.validEmails, text);
  };

  const handleFile = async (file: File) => {
    try {
      if (typeof file.text === 'function') {
        const text = await file.text();
        processText(text, file.name);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          if (text) processText(text, file.name);
        };
        reader.readAsText(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) processText(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleClear = () => {
    setParseResult(null);
    setFileName(null);
    onEmailsDetected([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        className="hidden"
        onChange={handleChange}
      />

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-brand-500 bg-brand-500/10'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-brand-400">
            {fileName ? <FileText className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">
              {fileName ? fileName : 'Click here to upload your .txt or .csv file'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any file containing your recipient emails
            </p>
          </div>
        </div>
      </div>

      {/* Parse Result Summary */}
      {parseResult && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">File Loaded: {fileName}</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Change File</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
              <div className="flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-sm font-bold">{parseResult.validEmails.length}</span>
              </div>
              <p className="text-[10px] text-emerald-400/80 uppercase font-medium">Valid Emails</p>
            </div>

            <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300">
              <div className="flex items-center justify-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-sm font-bold">{parseResult.invalidCount}</span>
              </div>
              <p className="text-[10px] text-rose-400/80 uppercase font-medium">Non-Email Lines</p>
            </div>

            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300">
              <div className="flex items-center justify-center space-x-1">
                <span className="text-sm font-bold">{parseResult.duplicateCount}</span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Duplicates</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
