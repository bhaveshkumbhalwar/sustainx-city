import fs from 'fs';

const content = fs.readFileSync('D:/WASTE_MANAGEMENT-main/WASTE_MANAGEMENT-main/SustainX-main/server/services/routeOptimization.js', 'utf8');

// Find module.exports
const idx = content.lastIndexOf('module.exports = {');
if (idx === -1) {
  console.log('module.exports not found');
  process.exit(1);
}

// Find the matching closing brace
let balance = 0;
let inString = false;
let stringChar = '';
let inComment = false;
let endIdx = -1;

for (let i = content.indexOf('module.exports = {'); i < content.length; i++) {
  const c = content[i];
  
  if (!inComment && (c === '"' || c === "'" || c === '`')) {
    if (!inString) { inString = true; }
    else if (c === content[i-1] !== '\\') inString = false;
  }
  
  if (!inString && content[i] === '/' && content[i+1] === '/') {
    inComment = true;
  }
  
  if (!inString && !inComment) {
    if (content[i] === '{') balance++;
    if (content[i] === '}') {
      balance--;
      if (balance === 0) {
        console.log('Found closing brace at index:', i);
        // Include up to and including this brace
        const newContent = content.slice(0, i + 1) + '\n';
        fs.writeFileSync('D:/WASTE_MANAGEMENT-main/WASTE_MANAGEMENT-main/SustainX-main/server/services/routeOptimization.js', newContent, 'utf8');
        console.log('Fixed and saved');
        process.exit(0);
      }
    }
  }
  
  // Handle comment end
  if (c === '\n') inComment = false;
}

console.log('Not found');