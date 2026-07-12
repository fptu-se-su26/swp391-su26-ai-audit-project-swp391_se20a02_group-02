const ExcelJS = require('exceljs');

const targetFile = process.argv[2];
if (!targetFile) {
    console.error("Please provide the path to the Excel file.");
    process.exit(1);
}
const excelPath = targetFile;

async function styleExcel() {
    console.log(`[INFO] Styling Excel file: ${excelPath}`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(excelPath);
    
    const sheet = workbook.worksheets[0];
    
    // Style Header Row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' } // Blue header
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    
    let passFailColumnIndex = -1;
    let actualStatusIndex = -1;
    
    headerRow.eachCell((cell, colNumber) => {
        if (cell.value === 'Pass/Fail' || cell.value === '__EMPTY_7') {
            passFailColumnIndex = colNumber;
            cell.value = 'Pass/Fail'; // rename back just in case
        }
        if (cell.value === 'Actual Status') {
            actualStatusIndex = colNumber;
        }
    });

    // Style data rows
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        
        // Add borders to all cells in the row
        row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
                top: {style:'thin'},
                left: {style:'thin'},
                bottom: {style:'thin'},
                right: {style:'thin'}
            };
            cell.alignment = { vertical: 'middle', wrapText: true };
        });

        // Color Pass/Fail
        if (passFailColumnIndex > -1) {
            const statusCell = row.getCell(passFailColumnIndex);
            if (statusCell.value === 'Passed') {
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light green
                statusCell.font = { color: { argb: 'FF006100' }, bold: true };
            } else if (statusCell.value === 'Failed') {
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } }; // Light red
                statusCell.font = { color: { argb: 'FF9C0006' }, bold: true };
            } else if (statusCell.value === 'Skipped (Parse Error)') {
                statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } }; // Yellow
                statusCell.font = { color: { argb: 'FF9C6500' } };
            }
        }
        
        // Color Actual Status
        if (actualStatusIndex > -1) {
            const actualStatusCell = row.getCell(actualStatusIndex);
            if (actualStatusCell.value === 200 || actualStatusCell.value === 201) {
                actualStatusCell.font = { color: { argb: 'FF006100' }, bold: true };
            } else if (actualStatusCell.value >= 400) {
                actualStatusCell.font = { color: { argb: 'FF9C0006' }, bold: true };
            }
        }
    });

    // Adjust column widths
    sheet.columns.forEach((column, index) => {
        if (index === 0) column.width = 15; // TC_ID
        else if (index === 1) column.width = 40; // Steps
        else if (index === 2) column.width = 25; // Expected
        else if (index === passFailColumnIndex - 1) column.width = 15; // Pass/Fail
        else column.width = 20;
    });

    await workbook.xlsx.writeFile(excelPath);
    console.log('[INFO] Styling complete!');
}

styleExcel().catch(console.error);
