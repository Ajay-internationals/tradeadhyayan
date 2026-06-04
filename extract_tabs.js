const fs = require('fs');
const path = require('path');

const pageContent = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

// Find imports and shared state
const startOfComponent = pageContent.indexOf('export default function DashboardPage() {');
const importsAndInterfaces = pageContent.substring(0, startOfComponent);

const endOfState = pageContent.indexOf('const fetchMistakeSummary =');
const stateVariables = pageContent.substring(startOfComponent, endOfState).replace('export default function DashboardPage() {', '');

const remainingFunctions = pageContent.substring(endOfState, pageContent.indexOf('return ('));

const commonTop = `
${importsAndInterfaces}

export default function ExtractedPage() {
${stateVariables}
${remainingFunctions}

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFBFF]">
      <div className="p-6">
`;

const commonBottom = `
      </div>
    </div>
  );
}
`;

const tabsToExtract = [
  'market',
  'mistakes',
  'mentor',
  'reports',
  'strategies',
  'tools',
  'goals',
  'calendar',
  'settings'
];

tabsToExtract.forEach(tab => {
  const marker = `{activeTab === "${tab}" && (`;
  const startIndex = pageContent.indexOf(marker);
  if (startIndex === -1) {
    console.log(`Tab ${tab} not found.`);
    return;
  }
  
  let openBraces = 0;
  let i = startIndex;
  let started = false;
  
  for (; i < pageContent.length; i++) {
    if (pageContent[i] === '{') {
      openBraces++;
      started = true;
    }
    if (pageContent[i] === '}') {
      openBraces--;
    }
    
    if (started && openBraces === 0) {
      break;
    }
  }
  
  let tabContent = pageContent.substring(startIndex, i + 1);
  // remove the wrapper: {activeTab === "..." && ( <content> )}
  tabContent = tabContent.replace(new RegExp(`^{activeTab === "${tab}" && \\(`), '');
  if (tabContent.endsWith(')}')) {
    tabContent = tabContent.slice(0, -2);
  }
  
  // Replace dark classes with vibrant ones
  tabContent = tabContent.replace(/bg-slate-800/g, 'bg-[#7C3AED]');
  tabContent = tabContent.replace(/hover:bg-slate-900/g, 'hover:bg-[#6D28D9]');

  const dirName = tab === 'mentor' ? 'mentor-review' : tab;
  const dirPath = path.join('app', 'dashboard', dirName);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const finalFileContent = commonTop + tabContent + commonBottom;
  
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), finalFileContent);
  console.log(`Extracted ${tab} to ${dirPath}/page.tsx`);
});
