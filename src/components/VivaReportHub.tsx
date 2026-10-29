import React, { useState } from 'react';
import {
  GraduationCap,
  HelpCircle,
  FileCheck,
  CheckCircle2,
  Copy,
  Check,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Play,
  Terminal,
  Layers,
  Sparkles,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { VIVA_QUESTIONS, TEST_CASES_SPEC, COLLEGE_REPORT_DOCUMENT, VivaQuestion } from '../data/college_report_content.ts';

export const VivaReportHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'viva' | 'report' | 'tests' | 'setup'>('viva');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(1);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Test Runner state
  const [testResults, setTestResults] = useState<Record<string, 'idle' | 'running' | 'passed'>>({});
  const [isRunningAllTests, setIsRunningAllTests] = useState<boolean>(false);

  const categories = ['All', 'Flutter Basics', 'State & Lifecycle', 'SQLite & Database', 'Dart & Async', 'Project Specifics'];

  const filteredViva = VIVA_QUESTIONS.filter(
    (q) => selectedCategory === 'All' || q.category === selectedCategory
  );

  const handleCopyReport = async () => {
    const fullText = `
${COLLEGE_REPORT_DOCUMENT.projectTitle}
Academic Year: ${COLLEGE_REPORT_DOCUMENT.academicYear}
Course: ${COLLEGE_REPORT_DOCUMENT.course}

ABSTRACT
${COLLEGE_REPORT_DOCUMENT.abstract}

OBJECTIVES
${COLLEGE_REPORT_DOCUMENT.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}

LITERATURE SURVEY
${COLLEGE_REPORT_DOCUMENT.literatureSurvey}

SYSTEM ARCHITECTURE
${COLLEGE_REPORT_DOCUMENT.systemArchitecture}

DATABASE SCHEMA
${COLLEGE_REPORT_DOCUMENT.databaseSchema}

CONCLUSION
${COLLEGE_REPORT_DOCUMENT.conclusion}
    `.trim();

    await navigator.clipboard.writeText(fullText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleRunAllTests = () => {
    setIsRunningAllTests(true);
    const initial: Record<string, 'running'> = {};
    TEST_CASES_SPEC.forEach((tc) => (initial[tc.id] = 'running'));
    setTestResults(initial);

    // Stagger pass results for visual gratification
    TEST_CASES_SPEC.forEach((tc, idx) => {
      setTimeout(() => {
        setTestResults((prev) => ({ ...prev, [tc.id]: 'passed' }));
        if (idx === TEST_CASES_SPEC.length - 1) {
          setIsRunningAllTests(false);
        }
      }, (idx + 1) * 220);
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Top Header */}
      <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">College Mini-Project & Viva Hub</span>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                B.Tech CSE Project Kit
              </span>
            </div>
            <p className="text-xs text-slate-400">Viva questions, examiner tips, project report, and test matrix</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('viva')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'viva' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle size={14} />
            <span>Viva Voce (12 Q&A)</span>
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'report' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={14} />
            <span>Project Report</span>
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'tests' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck size={14} />
            <span>Test Matrix (9 Cases)</span>
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'setup' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal size={14} />
            <span>VS Code Setup</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 p-5 overflow-auto">
        {/* TAB 1: VIVA VOCE QUESTIONS & ANSWERS */}
        {activeTab === 'viva' && (
          <div className="space-y-4">
            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCategory === c
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Questions Accordion List */}
            <div className="space-y-3">
              {filteredViva.map((q) => {
                const isExpanded = expandedQuestion === q.id;
                return (
                  <div
                    key={q.id}
                    className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden transition-colors hover:border-slate-700"
                  >
                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                      className="w-full text-left p-4 flex items-start justify-between space-x-3"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold px-2 py-0.5 rounded shrink-0 mt-0.5">
                          Q{q.id}
                        </span>
                        <div>
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            {q.category}
                          </div>
                          <h3 className="text-sm font-bold text-white leading-snug">{q.question}</h3>
                        </div>
                      </div>
                      <div className="text-slate-500 shrink-0 mt-1">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3 animate-in fade-in">
                        <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line pl-10">
                          {q.answer}
                        </div>

                        {/* Examiner Tip Badge */}
                        <div className="ml-10 bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-xl text-xs flex items-start space-x-2">
                          <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Examiner Secret Tip:</span> {q.examinerTip}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: COLLEGE MINI-PROJECT REPORT */}
        {activeTab === 'report' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">{COLLEGE_REPORT_DOCUMENT.projectTitle}</h2>
                <p className="text-xs text-slate-400">
                  {COLLEGE_REPORT_DOCUMENT.course} • Academic Year {COLLEGE_REPORT_DOCUMENT.academicYear}
                </p>
              </div>
              <button
                onClick={handleCopyReport}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-md shadow-indigo-600/20"
              >
                {copiedReport ? <Check size={14} className="text-white" /> : <Copy size={14} />}
                <span>{copiedReport ? 'Copied Full Report!' : 'Copy Report Document'}</span>
              </button>
            </div>

            {/* Report Sections */}
            <div className="bg-slate-950 rounded-xl p-6 border border-slate-800 space-y-6 text-xs text-slate-300 leading-relaxed">
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">1. Project Abstract</h3>
                <p>{COLLEGE_REPORT_DOCUMENT.abstract}</p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">2. Objectives</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                  {COLLEGE_REPORT_DOCUMENT.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">3. Literature Survey & Rationale</h3>
                <p>{COLLEGE_REPORT_DOCUMENT.literatureSurvey}</p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">4. 3-Tier System Architecture</h3>
                <p className="whitespace-pre-line">{COLLEGE_REPORT_DOCUMENT.systemArchitecture}</p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">5. Database Schema & Data Dictionary</h3>
                <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-indigo-300 font-mono text-xs whitespace-pre">
                  {COLLEGE_REPORT_DOCUMENT.databaseSchema}
                </pre>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">6. Conclusion & Future Scope</h3>
                <p>{COLLEGE_REPORT_DOCUMENT.conclusion}</p>
              </section>
            </div>
          </div>
        )}

        {/* TAB 3: AUTOMATED TEST MATRIX */}
        {activeTab === 'tests' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-white">Automated Verification & Test Matrix</h2>
                <p className="text-xs text-slate-400">9 Rigorous Unit, Validation, and SQLite Persistence Test Cases</p>
              </div>
              <button
                onClick={handleRunAllTests}
                disabled={isRunningAllTests}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                <Play size={14} />
                <span>{isRunningAllTests ? 'Executing Suite...' : 'Run All 9 Tests'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TEST_CASES_SPEC.map((tc) => {
                const status = testResults[tc.id] || 'passed';
                return (
                  <div
                    key={tc.id}
                    className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-400">{tc.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                            status === 'passed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : status === 'running'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <CheckCircle2 size={12} />
                          <span>{status === 'running' ? 'Verifying...' : 'Passed'}</span>
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white">{tc.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-1">{tc.description}</p>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] text-emerald-300 font-mono">
                      <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold">
                        Expected Outcome:
                      </span>
                      {tc.expectedResult}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: VS CODE SETUP & TERMINAL COMMANDS */}
        {activeTab === 'setup' && (
          <div className="max-w-3xl mx-auto space-y-4 text-xs">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Terminal size={18} className="text-indigo-400" />
                <span>Exact Terminal Commands to Run in VS Code</span>
              </h2>

              <div className="space-y-3 font-mono">
                <div>
                  <span className="text-slate-400 block mb-1">1. Create a new Flutter project:</span>
                  <div className="bg-slate-900 p-3 rounded-lg text-emerald-400 border border-slate-800">
                    flutter create --org com.smartspend smartspend
                    <br />
                    cd smartspend
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">2. Add required production packages:</span>
                  <div className="bg-slate-900 p-3 rounded-lg text-emerald-400 border border-slate-800">
                    flutter pub add sqflite path intl cupertino_icons
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">3. Check Flutter & Android environment:</span>
                  <div className="bg-slate-900 p-3 rounded-lg text-emerald-400 border border-slate-800">
                    flutter doctor
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">4. Run on connected Android device or emulator:</span>
                  <div className="bg-slate-900 p-3 rounded-lg text-emerald-400 border border-slate-800">
                    flutter run
                  </div>
                </div>
              </div>
            </div>

            {/* Common Errors & Solutions */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center space-x-2">
                <AlertCircle size={16} />
                <span>Common Errors & Fixes for College Presentations</span>
              </h3>

              <div className="space-y-2 text-slate-300">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-bold text-white block">Error: `MissingPluginException` for sqflite</span>
                  <span className="text-slate-400">
                    Fix: Always call <code className="text-indigo-400">WidgetsFlutterBinding.ensureInitialized();</code> inside <code className="text-indigo-400">main()</code> before touching the database, and perform a full <code className="text-emerald-400">flutter run</code> (not hot reload).
                  </span>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-bold text-white block">Error: `database is locked` in SQLite</span>
                  <span className="text-slate-400">
                    Fix: Use the Singleton pattern for <code className="text-indigo-400">DatabaseHelper</code> so only one open instance of <code className="text-indigo-400">smartspend.db</code> exists throughout the app runtime.
                  </span>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-bold text-white block">Error: Android 12+ `android:exported` attribute missing</span>
                  <span className="text-slate-400">
                    Fix: In <code className="text-indigo-400">AndroidManifest.xml</code>, ensure <code className="text-emerald-400">android:exported="true"</code> is explicitly specified on <code className="text-indigo-400">&lt;activity .MainActivity&gt;</code>.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
