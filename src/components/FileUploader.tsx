import React, { useRef, useState } from 'react';
import { FileText, FileSpreadsheet, X, Upload, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface FileUploaderProps {
  label: string;
  accept?: string;
  linkedEntityType?: string;
  linkedEntityId?: string;
  onUploadSuccess?: (doc: any) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  label, 
  accept = ".pdf,.xls,.xlsx", 
  linkedEntityType,
  linkedEntityId,
  onUploadSuccess 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      await uploadFile(selectedFile);
    }
  };

  const uploadFile = async (selectedFile: File) => {
    setIsUploading(true);
    setIsSuccess(false);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (linkedEntityType) formData.append('linkedEntityType', linkedEntityType);
    if (linkedEntityId) formData.append('linkedEntityId', linkedEntityId);

    try {
      const token = localStorage.getItem('firebase_user_token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const doc = await response.json();
      setIsSuccess(true);
      onUploadSuccess?.(doc);
    } catch (err: any) {
      setError(err.message || 'Failed to upload');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setIsSuccess(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isExcel = file?.name.endsWith('.xls') || file?.name.endsWith('.xlsx');

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{label}</label>
      
      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-white hover:border-accent/40 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:gold-gradient group-hover:text-white transition-all duration-500">
            <Upload className="w-5 h-5 text-slate-400 group-hover:text-white" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-600">Click to upload document</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Supports PDF or Excel</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept={accept} 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border",
              isExcel ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
            )}>
              {isExcel ? <FileSpreadsheet className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-xs font-bold text-primary truncate max-w-[200px]">{file.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {isUploading ? (
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Uploading...
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3" />
                    Stored Securely
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-2 text-[10px] text-rose-600 font-bold uppercase tracking-widest">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <button 
            onClick={removeFile}
            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
