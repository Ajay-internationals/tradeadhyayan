const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        processDir(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.js')) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8').trim();
        console.log(`Checking ${file}: length=${content.length}, startsWithQuote=${content.startsWith('"') || content.startsWith('\"')}, endsWithQuote=${content.endsWith('"') || content.endsWith('\"')}`);
        
        // If it starts with quote but doesn't end with it, let's see if we can parse it by adding a quote, or if it is truncated.
        if (content.startsWith('"')) {
          let parsed = null;
          // Try to parse as-is first
          try {
            parsed = JSON.parse(content);
          } catch (e) {
            // Try appending a quote (if truncated)
            try {
              parsed = JSON.parse(content + '"');
            } catch (e2) {
              // Try evaluating it
              try {
                parsed = eval(content);
              } catch (e3) {
                try {
                  parsed = eval(content + '"');
                } catch (e4) {
                  // Looser parser: replace escaped newlines manually
                  // If it starts with " and ends with " or not, we can remove the outer quotes and replace escaped quotes and newlines
                  console.log(`Standard JSON and eval parsing failed for ${file}, trying manual unescape...`);
                }
              }
            }
          }
          
          if (parsed && typeof parsed === 'string') {
            fs.writeFileSync(fullPath, parsed, 'utf8');
            console.log(`--> SUCCESS: Fixed ${file}`);
          } else {
            // Manual fallback unescape
            // Remove starting quote
            let raw = content.slice(1);
            // Remove ending quote if exists
            if (raw.endsWith('"')) {
              raw = raw.slice(0, -1);
            }
            // Replace escaped characters
            raw = raw.replace(/\\n/g, '\n')
                     .replace(/\\t/g, '\t')
                     .replace(/\\"/g, '"')
                     .replace(/\\\\/g, '\\');
            
            // Check if this looks like valid TSX/CSS code
            if (raw.includes('export') || raw.includes('import') || raw.includes('@theme') || raw.includes('body')) {
              fs.writeFileSync(fullPath, raw, 'utf8');
              console.log(`--> SUCCESS (Manual Unescape): Fixed ${file}`);
            } else {
              console.log(`--> FAILED to unescape ${file}: output didn't look like code`);
            }
          }
        }
      } catch (err) {
        console.error(`Error reading/processing ${fullPath}:`, err.message);
      }
    }
  }
}

const targetDir = process.argv[2] || path.join(__dirname, 'app');
console.log(`Starting JSON unescape process in: ${targetDir}`);
processDir(targetDir);
console.log('Finished processing.');
