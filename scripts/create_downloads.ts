import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { FLUTTER_PROJECT_FILES } from '../src/data/flutter_project_files.ts';
import { COLLEGE_REPORT_DOCUMENT, VIVA_QUESTIONS } from '../src/data/college_report_content.ts';
import { getWebProjectFiles } from '../src/services/projectZipExporter.ts';

async function main() {
  const publicDir = path.resolve(process.cwd(), 'public');
  const downloadsDir = path.resolve(publicDir, 'downloads');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  console.log('Generating ZIP archives in public/downloads...');

  // 1. Flutter Mobile App ZIP
  const flutterZip = new JSZip();
  const flutterFolder = flutterZip.folder('smartspend-flutter') || flutterZip;
  FLUTTER_PROJECT_FILES.forEach((f) => {
    flutterFolder.file(f.path, f.content);
  });
  const flutterBuffer = await flutterZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(path.join(downloadsDir, 'smartspend_flutter_project.zip'), flutterBuffer);
  console.log('Saved smartspend_flutter_project.zip (' + flutterBuffer.length + ' bytes)');

  // 2. Web App ZIP
  const webZip = new JSZip();
  const webFolder = webZip.folder('smartspend-web') || webZip;
  getWebProjectFiles().forEach((f) => {
    webFolder.file(f.path, f.content);
  });
  const webBuffer = await webZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(path.join(downloadsDir, 'smartspend_web_project.zip'), webBuffer);
  console.log('Saved smartspend_web_project.zip (' + webBuffer.length + ' bytes)');

  // 3. Complete Master Bundle ZIP
  const masterZip = new JSZip();
  const masterRoot = masterZip.folder('smartspend-project') || masterZip;

  const mFlutter = masterRoot.folder('smartspend-flutter') || masterRoot;
  FLUTTER_PROJECT_FILES.forEach((f) => {
    mFlutter.file(f.path, f.content);
  });

  const mWeb = masterRoot.folder('smartspend-web') || masterRoot;
  getWebProjectFiles().forEach((f) => {
    mWeb.file(f.path, f.content);
  });

  const mDocs = masterRoot.folder('docs') || masterRoot;
  mDocs.file(
    'PROJECT_REPORT.md',
    `# ${COLLEGE_REPORT_DOCUMENT.projectTitle}
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
`
  );

  mDocs.file(
    'VIVA_VOCE_PREPARATION_GUIDE.md',
    `# SmartSpend Viva Voce Q&A Bank (${VIVA_QUESTIONS.length} Questions)
${VIVA_QUESTIONS.map(
  (q) => `### Q${q.id}. ${q.question}
Answer: ${q.answer}
Examiner Tip: ${q.examinerTip}
---`
).join('\n\n')}`
  );

  masterRoot.file(
    'README.md',
    `# SmartSpend - Complete Personal Expense Tracker Project Folder 💸

This is the complete, single-folder project package for SmartSpend containing:
1. smartspend-flutter/ - Complete Flutter & SQLite offline mobile app
2. smartspend-web/ - Complete React 19 & Tailwind v4 financial dashboard
3. docs/ - College Project Report and Viva Voce preparation materials
`
  );

  const masterBuffer = await masterZip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(path.join(downloadsDir, 'smartspend_complete_project_folder.zip'), masterBuffer);
  console.log('Saved smartspend_complete_project_folder.zip (' + masterBuffer.length + ' bytes)');

  console.log('All downloads built successfully!');
}

main().catch(console.error);
