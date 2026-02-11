const fs = require('fs');

const tomlPath = '../Clarinet.toml';
const content = fs.readFileSync(tomlPath, 'utf8');

const contractPattern = /\[contracts\.([^\]]+)\]/g;
const contracts = new Map();
const lines = content.split('\n');

let currentContract = null;
let result = [];
let seenContracts = new Set();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(/^\[contracts\.([^\]]+)\]/);
  
  if (match) {
    currentContract = match[1];
    
    if (seenContracts.has(currentContract)) {
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^\[/)) {
        i++;
      }
      i--;
      continue;
    }
    
    seenContracts.add(currentContract);
  }
  
  result.push(line);
}

fs.writeFileSync(tomlPath, result.join('\n'));
console.log(`Removed ${seenContracts.size - contracts.size} duplicate entries`);
console.log(`Total unique contracts: ${seenContracts.size}`);
