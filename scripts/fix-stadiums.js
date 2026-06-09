const fs = require('fs');
let c = fs.readFileSync('src/data/stadiums.ts', 'utf8');
c = c.replace(/https:\/\/cdn\.worldcupsuites\.com\/[^\"]+/g, '/assets/stadium-placeholder.jpg');
fs.writeFileSync('src/data/stadiums.ts', c);
console.log('Fixed stadiums.ts');
