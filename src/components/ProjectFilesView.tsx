import React, { useState } from 'react';
import {
  FolderArchive,
  Download,
  Folder,
  FileCode,
  Copy,
  Check,
  Smartphone,
  Globe,
  Terminal,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import {
  generateFlutterProjectZip,
  generateWebProjectZip,
  generateMasterBundleZip,
  triggerBlobDownload,
  getWebProjectFiles,
} from '../services/projectZipExporter.ts';
import { FLUTTER_PROJECT_FILES, FlutterFile } from '../data/flutter_project_files.ts';

interface ProjectFilesViewProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ProjectFilesView: React.FC<ProjectFilesViewProps> = ({ onShowToast }) => {
  const [downloadingType, setDownloadingType] = useState<'master' | 'flutter' | 'web' | null>(null);
  const [activeProjectTab, setActiveProjectTab] = useState<'flutter' | 'web'>('flutter');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('lib/main.dart');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const webFiles = getWebProjectFiles();

  // Find active file
  const activeFileList = activeProjectTab === 'flutter' ? FLUTTER_PROJECT_FILES : webFiles;
  const currentFile = activeFileList.find((f) => f.path === selectedFilePath) || activeFileList[0];

  const handleDownloadMaster = async () => {
    setDownloadingType('master');
    try {
      const blob = await generateMasterBundleZip();
      triggerBlobDownload(blob, 'smartspend_complete_project_folder.zip');
      onShowToast('Complete project folder downloaded! Extract and open in VS Code 🎉', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to generate project archive. Please retry.', 'error');
    } finally {
      setDownloadingType(null);
    }
  };

  const handleDownloadFlutter = async () => {
    setDownloadingType('flutter');
    try {
      const blob = await generateFlutterProjectZip();
      triggerBlobDownload(blob, 'smartspend_flutter_project.zip');
      onShowToast('Flutter mobile project folder downloaded! 📱', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to generate Flutter archive.', 'error');
    } finally {
      setDownloadingType(null);
    }
  };

  const handleDownloadWeb = async () => {
    setDownloadingType('web');
    try {
      const blob = await generateWebProjectZip();
      triggerBlobDownload(blob, 'smartspend_web_project.zip');
      onShowToast('React web project folder downloaded! 🌐', 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to generate web archive.', 'error');
    } finally {
      setDownloadingType(null);
    }
  };

  const handleCopyCode = async () => {
    if (!currentFile) return;
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setCopiedCode(true);
      onShowToast(`Copied ${currentFile.path} to clipboard! 📋`, 'info');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#EDE9FE] via-[#E0F2FE] to-[#DCFCE7] p-6 sm:p-8 rounded-3xl border border-white/60 shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/80 backdrop-blur-xs rounded-full text-xs font-semibold text-purple-700 mb-3 border border-purple-200">
            <Sparkles size={14} className="text-purple-600 animate-pulse" />
            <span>Ready-to-Run Single Folder Download</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Complete Project Files in One Folder 📦
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
            Download the complete source code, directory structures, dependencies, tests, and documentation packaged neatly inside a single folder. Ready to extract and run on your machine in under two minutes!
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleDownloadMaster}
              disabled={downloadingType !== null}
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <FolderArchive size={18} className="text-purple-300" />
              <span>
                {downloadingType === 'master'
                  ? 'Packaging Zip Archive...'
                  : 'Download Complete Suite (.ZIP)'}
              </span>
            </button>

            <button
              onClick={handleDownloadFlutter}
              disabled={downloadingType !== null}
              className="inline-flex items-center space-x-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold text-sm shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Smartphone size={17} className="text-indigo-500" />
              <span>
                {downloadingType === 'flutter' ? 'Packaging Flutter...' : 'Flutter App Folder (.ZIP)'}
              </span>
            </button>

            <button
              onClick={handleDownloadWeb}
              disabled={downloadingType !== null}
              className="inline-flex items-center space-x-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold text-sm shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Globe size={17} className="text-blue-500" />
              <span>
                {downloadingType === 'web' ? 'Packaging Web...' : 'React Web Folder (.ZIP)'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Master Bundle */}
        <div className="bg-white rounded-3xl p-6 border-2 border-[#C4B5FD] shadow-xs relative flex flex-col justify-between hover:shadow-md transition-all">
          <div className="absolute -top-3 right-6 bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE] text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
            All-in-One Folder
          </div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-purple-600 flex items-center justify-center text-2xl mb-4">
              📦
            </div>
            <h3 className="text-lg font-bold text-slate-800">Master Project Suite</h3>
            <p className="text-xs text-slate-500 mt-1">
              The ultimate bundle containing Flutter mobile app + React web app + College Report in one single folder.
            </p>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span><code className="bg-slate-100 px-1.5 py-0.5 rounded text-purple-600 font-mono">smartspend-flutter/</code> complete folder</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span><code className="bg-slate-100 px-1.5 py-0.5 rounded text-purple-600 font-mono">smartspend-web/</code> complete folder</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span><code className="bg-slate-100 px-1.5 py-0.5 rounded text-purple-600 font-mono">docs/</code> Viva questions & report document</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadMaster}
            disabled={downloadingType !== null}
            className="mt-6 w-full py-3 bg-[#C4B5FD] hover:bg-[#B3A1FD] text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <Download size={15} />
            <span>Download All in One Folder (.ZIP)</span>
          </button>
        </div>

        {/* Card 2: Flutter Mobile */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] text-blue-600 flex items-center justify-center text-2xl mb-4">
              📱
            </div>
            <h3 className="text-lg font-bold text-slate-800">Flutter Mobile App</h3>
            <p className="text-xs text-slate-500 mt-1">
              B.Tech mini-project with SQLite persistence, Material Design 3, and all 4 CRUD operations.
            </p>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Local SQLite database with <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">sqflite</code></span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>5 full screens: Dashboard, Transactions, Add/Edit, Reports, Settings</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Tested offline functionality for Android</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadFlutter}
            disabled={downloadingType !== null}
            className="mt-6 w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <Download size={15} />
            <span>Download Flutter Folder (.ZIP)</span>
          </button>
        </div>

        {/* Card 3: React Web */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-emerald-600 flex items-center justify-center text-2xl mb-4">
              🌐
            </div>
            <h3 className="text-lg font-bold text-slate-800">React Web Dashboard</h3>
            <p className="text-xs text-slate-500 mt-1">
              Modern SaaS website with pastel aesthetics, Recharts analytics, and local storage persistence.
            </p>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>React 19 + TypeScript + Vite + Tailwind v4</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Recharts bar, doughnut & trend visualizations</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Budget health tracker, CSV export & JSON backup</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadWeb}
            disabled={downloadingType !== null}
            className="mt-6 w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <Download size={15} />
            <span>Download Web Folder (.ZIP)</span>
          </button>
        </div>
      </div>

      {/* Step-by-Step Run Instructions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] text-amber-700 flex items-center justify-center text-lg">
            ⚡
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">How to Run on Your Computer in 2 Minutes</h2>
            <p className="text-xs text-slate-500">Step-by-step instructions for Windows, macOS, or Linux</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-2">
            <div className="text-xs font-bold text-purple-600 tracking-wider uppercase">Step 1</div>
            <h4 className="font-bold text-slate-800 text-sm">Extract the Downloaded ZIP</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Right-click the downloaded <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-700">.zip</code> file and click <strong>Extract All...</strong>. This will produce a single clean project folder.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-2">
            <div className="text-xs font-bold text-blue-600 tracking-wider uppercase">Step 2</div>
            <h4 className="font-bold text-slate-800 text-sm">Open in VS Code</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Launch <strong>Visual Studio Code</strong>, click <strong>File &gt; Open Folder...</strong>, and select the extracted folder (<code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-700">smartspend-flutter</code> or <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-700">smartspend-web</code>).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-2">
            <div className="text-xs font-bold text-emerald-600 tracking-wider uppercase">Step 3</div>
            <h4 className="font-bold text-slate-800 text-sm">Run 1 Terminal Command</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Open the built-in terminal (<kbd className="bg-white px-1 py-0.5 rounded border border-slate-200 text-[10px] font-mono">Ctrl + `</kbd>) and execute:
            </p>
            <div className="mt-2 bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-xs flex items-center justify-between">
              <span>flutter run <span className="text-slate-400">or</span> npm run dev</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Project File Explorer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <span>Inspect Project File Tree</span>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {activeFileList.length} files
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse every source file, view code with line numbers, and copy directly
            </p>
          </div>

          {/* Project Switcher Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => {
                setActiveProjectTab('flutter');
                setSelectedFilePath('lib/main.dart');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                activeProjectTab === 'flutter'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Smartphone size={14} className={activeProjectTab === 'flutter' ? 'text-indigo-600' : ''} />
              <span>Flutter Files ({FLUTTER_PROJECT_FILES.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveProjectTab('web');
                setSelectedFilePath('package.json');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                activeProjectTab === 'web'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Globe size={14} className={activeProjectTab === 'web' ? 'text-emerald-600' : ''} />
              <span>Web Files ({webFiles.length})</span>
            </button>
          </div>
        </div>

        {/* File Explorer Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* File Tree Left Column */}
          <div className="lg:col-span-4 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-3 max-h-[520px] overflow-y-auto space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Folder size={13} />
              <span>{activeProjectTab === 'flutter' ? 'smartspend-flutter/' : 'smartspend-web/'}</span>
            </div>

            {activeFileList.map((file) => {
              const isSelected = file.path === currentFile?.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-purple-100/70 text-purple-900 font-bold border border-purple-200'
                      : 'hover:bg-slate-200/60 text-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode
                      size={14}
                      className={isSelected ? 'text-purple-600 shrink-0' : 'text-slate-400 shrink-0'}
                    />
                    <span className="font-mono text-[12px] truncate">{file.path}</span>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`shrink-0 ml-1 transition-transform ${
                      isSelected ? 'text-purple-600 translate-x-0.5' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Code Viewer Right Column */}
          <div className="lg:col-span-8 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col shadow-inner">
            {/* Code Header */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="font-mono text-xs text-slate-300 font-bold ml-2">
                  {currentFile?.path}
                </span>
              </div>

              <button
                onClick={handleCopyCode}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* File Description Tag */}
            {currentFile?.description && (
              <div className="bg-slate-850 px-4 py-2 border-b border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-mono text-[10px]">
                  {currentFile.category.toUpperCase()}
                </span>
                <span>{currentFile.description}</span>
              </div>
            )}

            {/* Code Content Area */}
            <div className="p-4 max-h-[440px] overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed selection:bg-purple-900 selection:text-white">
              <pre className="whitespace-pre overflow-x-auto">
                {currentFile?.content}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
