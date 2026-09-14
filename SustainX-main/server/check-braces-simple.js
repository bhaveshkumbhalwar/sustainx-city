const fs = require('fs');
const content = fs.readFileSync('D:\\WASTE_MANAGEMENT-main\\WASTE_MANAGEMENT-main\\SustainX-main\\server\\services\\routeOptimization.js', 'utf8');
const lines = content.split('\n');

let balance = 0;
lines.forEach((line, i) => {
  for (let j = 0; j < line.length; j++) {
    const c = line[j];
    if (c === '{') balance++;
    if (c === '}') balance--;
  }
});

console.log('Final balance:', balance);