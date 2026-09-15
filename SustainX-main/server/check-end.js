const fs = require('fs');
const content = fs.readFileSync('D:\\WASTE_MANAGEMENT-main\\WASTE_MANAGEMENT-main\\SustainX-main\\server\\services\\routeOptimization.js', 'utf8');
console.log('Length:', content.length);
console.log('Last 200 chars:', JSON.stringify(content.slice(-200)));
console.log('Ends with newline:', content.endsWith('\n'));
const lines = content.split('\n');
for (let i = Math.max(0, lines.length - 10); i < lines.length; i++) {
  console.log((i+1).toString().padStart(4), ':', lines[i]);
});