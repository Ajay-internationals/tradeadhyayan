const fs = require('fs');
const path = require('path');

const pageContent = fs.readFileSync('app/dashboard/page.tsx', 'utf8');

const startOfComponent = pageContent.indexOf('export default function DashboardPage() {');
const importsAndInterfaces = pageContent.substring(0, startOfComponent);

const endOfState = pageContent.indexOf('const fetchMistakeSummary =');
const stateVariables = pageContent.substring(startOfComponent, endOfState).replace('export default function DashboardPage() {', '');

const remainingFunctions = pageContent.substring(endOfState, pageContent.indexOf('return ('));

const dashboardMarker = '{activeTab === "dashboard" && (';
const startIndex = pageContent.indexOf(dashboardMarker);

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
tabContent = tabContent.replace(new RegExp(`^{activeTab === "dashboard" && \\(`), '');
if (tabContent.endsWith(')}')) {
  tabContent = tabContent.slice(0, -2);
}

// Replace dark classes
tabContent = tabContent.replace(/bg-slate-800/g, 'bg-[#7C3AED]');
tabContent = tabContent.replace(/hover:bg-slate-900/g, 'hover:bg-[#6D28D9]');

const finalFileContent = `
${importsAndInterfaces}

export default function DashboardPage() {
${stateVariables}
${remainingFunctions}

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAFBFF]">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end pb-4 border-b border-[#E9E6F5] mb-6">
          <div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Performance Overview</h1>
            <p className="text-sm font-semibold text-[#64748B] mt-1">Your high-level statistics and equity curve.</p>
          </div>
        </div>
        ${tabContent}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('app/dashboard/page.tsx', finalFileContent);
console.log('Cleaned up app/dashboard/page.tsx');
