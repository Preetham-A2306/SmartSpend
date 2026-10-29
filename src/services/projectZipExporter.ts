import JSZip from 'jszip';
import { FLUTTER_PROJECT_FILES } from '../data/flutter_project_files.ts';
import { COLLEGE_REPORT_DOCUMENT, VIVA_QUESTIONS } from '../data/college_report_content.ts';

// Helper to trigger browser file download
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Generate Flutter Project ZIP
export async function generateFlutterProjectZip(): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder('smartspend-flutter') || zip;

  FLUTTER_PROJECT_FILES.forEach((file) => {
    root.file(file.path, file.content);
  });

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

// Generate Web Project Files
export function getWebProjectFiles(): { path: string; description: string; category: string; content: string }[] {
  return [
    {
      path: 'package.json',
      category: 'config',
      description: 'NPM package dependencies and scripts for Vite & React 19',
      content: JSON.stringify(
        {
          name: 'smartspend-web',
          private: true,
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite --port=3000 --host=0.0.0.0',
            build: 'vite build',
            preview: 'vite preview',
            lint: 'tsc --noEmit',
          },
          dependencies: {
            react: '^19.0.1',
            'react-dom': '^19.0.1',
            recharts: '^3.10.1',
            'lucide-react': '^0.546.0',
            jszip: '^3.10.2',
            motion: '^12.23.24',
            tailwindcss: '^4.3.3',
            '@tailwindcss/vite': '^4.3.3',
            '@vitejs/plugin-react': '^6.1.1',
            vite: '^8.3.0',
          },
          devDependencies: {
            typescript: '^7.0.2',
            '@types/react': '^19.3.0',
            '@types/react-dom': '^19.3.0',
            '@types/node': '^22.14.0',
            '@types/jszip': '^3.4.0',
          },
        },
        null,
        2
      ),
    },
    {
      path: 'vite.config.ts',
      category: 'config',
      description: 'Vite build configuration with Tailwind CSS v4 and React plugins',
      content: `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
`,
    },
    {
      path: 'tsconfig.json',
      category: 'config',
      description: 'TypeScript configuration with strict type checking and bundler resolution',
      content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./*"]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  },
  "include": ["src"]
}
`,
    },
    {
      path: 'index.html',
      category: 'core',
      description: 'HTML5 entry point with responsive viewport, Google Fonts, and OpenGraph meta',
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SmartSpend – Personal Expense Tracker 💸</title>
    <meta name="description" content="Personal expense tracker and budget planner with pastel analytics." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#F8FAFC] text-slate-800 antialiased font-['Plus_Jakarta_Sans',sans-serif]">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
    {
      path: 'src/index.css',
      category: 'styling',
      description: 'Tailwind CSS v4 stylesheet with custom pastel color variables and scrollbar rules',
      content: `@import "tailwindcss";

:root {
  --color-pastel-bg: #F8FAFC;
  --color-pastel-lavender: #C4B5FD;
  --color-pastel-blue: #BAE6FD;
  --color-pastel-mint: #BBF7D0;
  --color-pastel-coral: #FECACA;
  --color-pastel-yellow: #FEF3C7;
  --color-card-bg: #FFFFFF;
  --color-dark-slate: #334155;
  --color-muted-gray: #94A3B8;
}

body {
  background-color: var(--color-pastel-bg);
  color: var(--color-dark-slate);
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #CBD5E1;
}
`,
    },
    {
      path: 'src/main.tsx',
      category: 'core',
      description: 'React 19 root bootstrap mounting App to root DOM element',
      content: `import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
`,
    },
    {
      path: 'README.md',
      category: 'config',
      description: 'Project README with setup steps, features overview, and tech stack details',
      content: `# SmartSpend – Personal Expense Tracker (Web App) 💸

A modern, responsive, and visually delightful Personal Expense Tracker built with React 19, TypeScript, Tailwind CSS v4, and Recharts.

## Features
- 💰 **Real-Time Financial Dashboard**: Total Balance, Total Income, Total Expenses, and Savings rate.
- 📊 **Pastel Analytics & Charts**: Income vs Expenses bar chart, Category distribution doughnut, Monthly spending trend.
- 💳 **Complete CRUD Transactions**: Add, edit, delete, search, filter by category/type, sort by date, and export to CSV.
- 🎯 **Budget Planner**: Monthly spending limit, category-wise budgets, health alerts (green/amber/red), and 50/30/20 tips.
- ⚙️ **Data Persistence**: Offline-first local storage with one-click JSON backup and restore.
- 📁 **Single Folder Project Export**: 1-click download of the complete codebase as a ready-to-run folder.

## Quick Start
\`\`\`bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in your browser
# Visit http://localhost:3000
\`\`\`
`,
    },
  ];
}

// Generate Web Project ZIP
export async function generateWebProjectZip(): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder('smartspend-web') || zip;

  const webFiles = getWebProjectFiles();
  webFiles.forEach((file) => {
    root.file(file.path, file.content);
  });

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

// Generate Complete All-in-One Master Bundle ZIP
export async function generateMasterBundleZip(): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder('smartspend-project') || zip;

  // 1. Flutter Mobile App Folder
  const flutterFolder = root.folder('smartspend-flutter') || root;
  FLUTTER_PROJECT_FILES.forEach((file) => {
    flutterFolder.file(file.path, file.content);
  });

  // 2. React Web App Folder
  const webFolder = root.folder('smartspend-web') || root;
  const webFiles = getWebProjectFiles();
  webFiles.forEach((file) => {
    webFolder.file(file.path, file.content);
  });

  // 3. College Mini-Project Documentation Folder
  const docsFolder = root.folder('docs') || root;

  // Full Report Document
  const reportDoc = `
# ${COLLEGE_REPORT_DOCUMENT.projectTitle}
**Academic Year:** ${COLLEGE_REPORT_DOCUMENT.academicYear}
**Course:** ${COLLEGE_REPORT_DOCUMENT.course}
**Subject:** Mobile Application Development Mini-Project

---

## 1. ABSTRACT
${COLLEGE_REPORT_DOCUMENT.abstract}

---

## 2. PROJECT OBJECTIVES
${COLLEGE_REPORT_DOCUMENT.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}

---

## 3. LITERATURE SURVEY
${COLLEGE_REPORT_DOCUMENT.literatureSurvey}

---

## 4. SYSTEM ARCHITECTURE
${COLLEGE_REPORT_DOCUMENT.systemArchitecture}

---

## 5. DATABASE SCHEMA (SQLite & PostgreSQL)
${COLLEGE_REPORT_DOCUMENT.databaseSchema}

---

## 6. CONCLUSION & FUTURE SCOPE
${COLLEGE_REPORT_DOCUMENT.conclusion}
`.trim();

  docsFolder.file('PROJECT_REPORT.md', reportDoc);

  // Viva Voce Guide
  const vivaGuide = `
# SmartSpend – Viva Voce Examination Question & Answer Bank
Total Questions: ${VIVA_QUESTIONS.length}
Target Audience: B.Tech Computer Science & Engineering Students

${VIVA_QUESTIONS.map(
  (q) => `
### Q${q.id}. ${q.question}
**Category:** ${q.category}

**Answer:**
${q.answer}

*Examiner Tip:* ${q.examinerTip}
---
`
).join('\n')}
`.trim();

  docsFolder.file('VIVA_VOCE_PREPARATION_GUIDE.md', vivaGuide);

  // Root Master README
  const masterReadme = `# SmartSpend – Complete Personal Expense Tracker Project Suite 💸

Welcome to the all-in-one SmartSpend project repository! This single folder bundle contains everything you need to run, inspect, submit, and present SmartSpend.

## 📁 What's Inside This Folder

\`\`\`
smartspend-project/
├── smartspend-flutter/          # Complete Flutter SQLite Mobile App
│   ├── lib/
│   │   ├── main.dart            # App entry point with Material Design 3
│   │   ├── models/              # TransactionModel & CategoryModel
│   │   ├── database/            # SQLite DatabaseHelper (singleton & CRUD)
│   │   ├── repositories/        # TransactionRepository
│   │   ├── screens/             # Dashboard, Transactions, Add/Edit, Reports, Settings
│   │   ├── widgets/             # Reusable summary cards, charts, list items
│   │   └── utils/               # Currency, Date, and Category constants
│   ├── android/                 # Android manifest and build configuration
│   ├── test/                    # Unit & widget tests
│   ├── pubspec.yaml             # Flutter dependencies (sqflite, path, intl)
│   └── README.md                # Mobile app setup instructions
│
├── smartspend-web/              # Complete React 19 + Vite SaaS Web App
│   ├── src/                     # React components, Tailwind styling, Recharts
│   ├── package.json             # NPM dependencies & scripts
│   ├── vite.config.ts           # Vite build configuration
│   ├── index.html               # Responsive HTML entry
│   └── README.md                # Web app setup instructions
│
└── docs/                        # College Submission & Examination Materials
    ├── PROJECT_REPORT.md        # Complete academic report (Abstract, ERD, Schema, Architecture)
    └── VIVA_VOCE_PREPARATION_GUIDE.md # 20 Comprehensive Viva questions & answers
\`\`\`

---

## 🚀 How to Run the Flutter Mobile App (In 3 Minutes)

1. Open VS Code or Android Studio.
2. Click **File > Open Folder** and choose \`smartspend-flutter\`.
3. Open terminal in that folder:
   \`\`\`bash
   flutter pub get
   flutter run
   \`\`\`
4. Select your connected Android phone or Android Emulator.

---

## 🌐 How to Run the React Web App (In 2 Minutes)

1. Open VS Code or terminal.
2. Navigate to \`smartspend-web\`:
   \`\`\`bash
   cd smartspend-web
   npm install
   npm run dev
   \`\`\`
3. Open your browser at \`http://localhost:3000\`.

---

## 🎓 College Viva & Mini-Project Presentation Tips
- Read \`docs/VIVA_VOCE_PREPARATION_GUIDE.md\` for the top questions external examiners ask on SQLite, ACID properties, and Flutter lifecycle.
- Read \`docs/PROJECT_REPORT.md\` for ready-to-print abstract, methodology, and conclusion.
`;

  root.file('README.md', masterReadme);

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
