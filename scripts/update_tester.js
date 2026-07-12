const ExcelJS = require('exceljs');

const targetFile = process.argv[2];
if (!targetFile) {
    console.error("Please provide the path to the Excel file.");
    process.exit(1);
}
const files = [targetFile];

async function updateTesterInfo(excelPath) {
    console.log(`[INFO] Updating tester info for: ${excelPath}`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    
    const sheet = workbook.worksheets[0];
    
    const headerRow = sheet.getRow(1);
    let passFailColumnIndex = -1;
    let dateColumnIndex = -1;
    let testerColumnIndex = -1;
    
    headerRow.eachCell((cell, colNumber) => {
        if (cell.value === 'Pass/Fail' || cell.value === 'Lần 1' || cell.value === '__EMPTY_7') {
            passFailColumnIndex = colNumber;
        }
        if (cell.value === 'Ngày Test' || cell.value === 'Ngày Test ' || cell.value === '__EMPTY_8') {
            dateColumnIndex = colNumber;
        }
        if (cell.value === 'Người Test' || cell.value === 'Người Test ' || cell.value === '__EMPTY_9') {
            testerColumnIndex = colNumber;
        }
    });

    // Fallbacks if header names are slightly different
    if (dateColumnIndex === -1 && passFailColumnIndex !== -1) dateColumnIndex = passFailColumnIndex + 1;
    if (testerColumnIndex === -1 && passFailColumnIndex !== -1) testerColumnIndex = passFailColumnIndex + 2;

    sheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 1) return; // skip header
        
        // Check if there is a TC ID in the first column
        const tcId = row.getCell(1).value;
        if (tcId && tcId.toString().startsWith('TC-')) {
            const statusCell = row.getCell(passFailColumnIndex);
            
            // Only add date and tester if the test was actually run or skipped
            if (statusCell.value) {
                row.getCell(dateColumnIndex).value = '3/7/2026';
                row.getCell(testerColumnIndex).value = 'Trung';
            }
        }
    });

    await workbook.xlsx.writeFile(excelPath);
    console.log(`[INFO] Successfully updated: ${excelPath}`);
}

async function main() {
    for (const file of files) {
        try {
            await updateTesterInfo(file);
        } catch (e) {
            console.error(`[ERROR] Failed to update ${file}: ${e.message}`);
        }
    }
}

main();
