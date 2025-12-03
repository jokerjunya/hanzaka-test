// =====================================================
// CSVDropzone - CSV Upload Component
// =====================================================

'use client';

import { useCallback, useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  FileText,
  ArrowUpCircle
} from 'lucide-react';

interface CSVDropzoneProps {
  onFilesUploaded: (engagementFile: File, stressFile: File) => void;
  isLoading?: boolean;
}

export function CSVDropzone({ onFilesUploaded, isLoading }: CSVDropzoneProps) {
  const [engagementFile, setEngagementFile] = useState<File | null>(null);
  const [stressFile, setStressFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'));
    processFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.name.endsWith('.csv'));
    processFiles(files);
  }, []);

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      const name = file.name.toLowerCase();
      if (name.includes('engagement') || name.includes('エンゲージメント')) {
        setEngagementFile(file);
      } else if (name.includes('stress') || name.includes('ストレス')) {
        setStressFile(file);
      } else if (!engagementFile) {
        setEngagementFile(file);
      } else if (!stressFile) {
        setStressFile(file);
      }
    });
  };

  const handleSubmit = () => {
    if (engagementFile && stressFile) {
      onFilesUploaded(engagementFile, stressFile);
    }
  };

  const canSubmit = engagementFile && stressFile && !isLoading;

  return (
    <div className="space-y-6">
      {/* ドロップゾーン */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={`
          relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
          ${isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
          }
        `}
      >
        <input
          type="file"
          accept=".csv"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center">
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors
            ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}
          `}>
            <ArrowUpCircle className="w-7 h-7" />
          </div>
          <p className="text-base font-medium text-gray-700 mb-1">
            CSVファイルをドラッグ＆ドロップ
          </p>
          <p className="text-sm text-gray-500 mb-4">
            または <span className="text-blue-600 font-medium">クリックして選択</span>
          </p>
          <p className="text-xs text-gray-400">
            エンゲージメントサーベイ・ストレスチェックの2ファイルを選択してください
          </p>
        </div>
      </div>

      {/* ファイル状態 */}
      <div className="grid grid-cols-2 gap-4">
        <FileStatusCard
          label="エンゲージメントサーベイ"
          file={engagementFile}
          onClear={() => setEngagementFile(null)}
        />
        <FileStatusCard
          label="ストレスチェック"
          file={stressFile}
          onClear={() => setStressFile(null)}
        />
      </div>

      {/* 分析開始ボタン */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`
          w-full py-3.5 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2
          ${canSubmit
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            分析中...
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-5 h-5" />
            分析を開始する
          </>
        )}
      </button>
    </div>
  );
}

function FileStatusCard({ 
  label, 
  file, 
  onClear 
}: { 
  label: string; 
  file: File | null; 
  onClear: () => void;
}) {
  return (
    <div className={`
      rounded-xl p-4 border transition-all
      ${file 
        ? 'bg-green-50 border-green-200' 
        : 'bg-gray-50 border-gray-200'
      }
    `}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        {file ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
        )}
      </div>
      {file ? (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-800 truncate">{file.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="ml-auto p-1 hover:bg-green-100 rounded-full transition-colors"
          >
            <XCircle className="w-4 h-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400">未選択</p>
      )}
    </div>
  );
}
