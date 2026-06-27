import ExcelJS from 'exceljs';
import { writeFileSync } from 'fs';

async function main() {
  try {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('docs/bracket-mundial-2026-2026-06-12.xlsx');
    let out = `Sheet names: ${wb.worksheets.map(s => s.name).join(', ')}\n\n`;
    
    for (const sheet of wb.worksheets) {
      out += `--- Sheet: ${sheet.name} ---\n`;
      let count = 0;
      sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        if (count < 100) {
          out += `Row ${rowNumber}: ${JSON.stringify(row.values)}\n`;
          count++;
        }
      });
      out += '\n';
    }
    
    writeFileSync('excel-inspection.txt', out, 'utf8');
    console.log('Done!');
  } catch (err) {
    writeFileSync('excel-inspection.txt', 'Error: ' + err.stack, 'utf8');
    console.error(err);
  }
}

main().catch(err => {
  console.error(err);
});
