import ExcelJS from 'exceljs';
import { join } from 'path';

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('docs/bracket-mundial-2026-2026-06-12.xlsx');
  console.log('Sheet names:', wb.worksheets.map(s => s.name));
  
  for (const sheet of wb.worksheets) {
    console.log(`\n--- Sheet: ${sheet.name} ---`);
    const rows = [];
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber <= 10) {
        rows.push({
          rowNumber,
          values: row.values
        });
      }
    });
    console.log(JSON.stringify(rows, null, 2));
  }
}

main().catch(err => {
  console.error(err);
});
