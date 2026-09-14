const fs = require('fs');
const content = fs.readFileSync('D:\\WASTE_MANAGEMENT-main\\WASTE_MANAGEMENT-main\\SustainX-main\\server\\services\\routeOptimization.js', 'utf8');
const lines = content.split('\n');
let balance = 0;
let inString = false;
let stringChar = '';
let inComment = false;

lines.forEach((line, i) => {
  let j = 0;
  while (j < line.length) {
    const c = line[j];
    const next = line[j + 1];

    // Handle string literals
    if (!inComment && (c === '"' || c === "'" || c === '`')) {
      if (!inString) {
        inString = true;
        stringChar = c;
      } else if (c === stringChar && line[j - 1] !== '\\') {
        inString = false;
        stringChar = '';
      }
    }

    // Handle comments
    if (!inString && c === '/' && line[j + 1] === '/') {
      inComment = true;
    }

    if (!inString && !inComment) {
      if (c === '{') {
        balance++;
        if (balance <= 10) console.log('Open at line', i + 1, 'balance:', balance, '|', line.trim().substring(0, 60));
      }
      if (c === '}') {
        balance--;
        console.log('Close at line', i + 1, 'balance:', balance, '|', line.trim().substring(0, 60));
      }
    }

    // Handle comment end
    if (c === '\n') {
      inComment = false;
    }

    j++;
  }
});

console.log('Final balance:', balance);