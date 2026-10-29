import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Folder, Terminal, Sparkles, ExternalLink, ChevronRight } from 'lucide-react';
import JSZip from 'jszip';
import { FLUTTER_PROJECT_FILES, FlutterFile } from '../data/flutter_project_files.ts';

interface FlutterCodeViewerProps {
  initialFile?: string;
}

export const FlutterCodeViewer: React.FC<FlutterCodeViewerProps> = ({ initialFile }) => {
  const [selectedPath, setSelectedPath] = useState<string>(initialFile || 'lib/database/database_helper.dart');
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const currentFile = FLUTTER_PROJECT_FILES.find((f) => f.path === selectedPath) || FLUTTER_PROJECT_FILES[0];

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const rootFolder = zip.folder('smartspend') || zip;

      FLUTTER_PROJECT_FILES.forEach((file) => {
        rootFolder.file(file.path, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'smartspend_flutter_project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create project ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Group files by category
  const categories = [
    { id: 'database', label: 'Database & SQLite', icon: '🗄️' },
    { id: 'screen', label: 'UI Screens', icon: '📱' },
    { id: 'repository', label: 'Repositories & Logic', icon: '⚡' },
    { id: 'model', label: 'Data Models', icon: '📦' },
    { id: 'widget', label: 'Reusable Widgets', icon: '🧩' },
    { id: 'util', label: 'Formatters & Utils', icon: '🛠️' },
    { id: 'core', label: 'App Entry & Tests', icon: '🎯' },
    { id: 'config', label: 'Config & Manifest', icon: '⚙️' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Top Header Bar */}
      <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileCode size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">Flutter Code Repository</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Dart 3.x • Material 3
              </span>
            </div>
            <p className="text-xs text-slate-400">Complete, runnable code files for your B.Tech mini-project</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied File!' : 'Copy File'}</span>
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
          >
            <Download size={14} />
            <span>{isZipping ? 'Archiving...' : 'Download Project (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: File Explorer Sidebar + Code View */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[550px]">
        {/* Left File Tree Sidebar */}
        <div className="w-full md:w-72 bg-slate-950/80 border-r border-slate-800/80 p-3 overflow-y-auto space-y-4 shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
            <span>Project Explorer</span>
            <span className="text-[10px] text-indigo-400">{FLUTTER_PROJECT_FILES.length} Files</span>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => {
              const filesInCat = FLUTTER_PROJECT_FILES.filter((f) => f.category === cat.id);
              if (filesInCat.length === 0) return null;

              return (
                <div key={cat.id} className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 px-2 flex items-center space-x-1.5">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>
                  <div className="space-y-0.5">
                    {filesInCat.map((file) => {
                      const isSelected = file.path === selectedPath;
                      const fileName = file.path.split('/').pop();
                      return (
                        <button
                          key={file.path}
                          onClick={() => setSelectedPath(file.path)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{fileName}</span>
                          <span
                            className={`text-[10px] font-mono px-1 rounded ${
                              isSelected ? 'text-indigo-200' : 'text-slate-500'
                            }`}
                          >
                            {file.path.startsWith('lib/') ? 'lib' : file.path.split('/')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Code Content Pane */}
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
          {/* File Header */}
          <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 overflow-hidden">
              <span className="font-mono font-semibold text-indigo-400 text-xs truncate">{currentFile.path}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-[11px] truncate">{currentFile.description}</span>
            </div>
            <div className="text-slate-400 text-[11px] shrink-0 font-mono">
              {currentFile.content.split('\n').length} lines
            </div>
          </div>

          {/* Syntax Display */}
          <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed selection:bg-indigo-500/30">
            <pre className="text-slate-200 whitespace-pre">
              <code>
                {currentFile.content.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row hover:bg-slate-800/40">
                    <span className="table-cell pr-4 text-slate-600 select-none text-right w-10">
                      {idx + 1}
                    </span>
                    <span className="table-cell">{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
