const ExcelJS = require('exceljs');
const targetFile = process.argv[2];

if (!targetFile) {
    console.error("Please provide the path to the Excel file.");
    process.exit(1);
}

async function fixFormatting() {
    console.log(`[INFO] Fixing formatting for: ${targetFile}`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(targetFile);
    
    const sheet = workbook.worksheets[0];

    // Find the row that contains the actual headers (like 'Mã Test Case' or 'Test Case ID')
    let actualHeaderRowNumber = -1;
    sheet.eachRow((row, rowNumber) => {
        let hasTestCaseID = false;
        row.eachCell((cell) => {
            if (cell.value && (cell.value.toString().includes('Mã Test Case') || cell.value.toString().includes('Test Case ID'))) {
                hasTestCaseID = true;
            }
        });
        if (hasTestCaseID && actualHeaderRowNumber === -1) {
            actualHeaderRowNumber = rowNumber;
        }
    });

    if (actualHeaderRowNumber === -1) {
         console.log("Could not find header row");
         return;
    }

    console.log(`Found actual headers at row: ${actualHeaderRowNumber}`);

    // If there are garbage header rows above the real header (from SheetJS), let's remove them,
    // but preserve the title if possible.
    // Actually, to make it perfectly clean, we can just delete rows 1 to actualHeaderRowNumber - 1
    // and make the actual header row the FIRST row.
    const rowsToDelete = actualHeaderRowNumber - 1;
    if (rowsToDelete > 0) {
        sheet.spliceRows(1, rowsToDelete);
    }

    // Now the header is at Row 1.
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' } // Blue
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    let passFailColumnIndex = -1;
    let actualStatusIndex = -1;

    headerRow.eachCell((cell, colNumber) => {
        const val = cell.value ? cell.value.toString().toLowerCase() : '';
        if (val.includes('pass/fail') || val.includes('lần 1') || val.includes('round 1')) {
            passFailColumnIndex = colNumber;
            cell.value = 'Pass/Fail'; // Normalize
        }
        if (val.includes('actual status')) {
            actualStatusIndex = colNumber;
        }
        // Fix weird empty headers
        if (val.includes('__empty')) {
            cell.value = ''; 
        }
    });

    // Style data rows (safely, without includeEmpty: true)
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        
        row.eachCell((cell, colNumber) => {
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
            if (statusCell.value) {
                const valStr = statusCell.value.toString().toLowerCase();
                if (valStr.includes('pass')) {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                    statusCell.font = { color: { argb: 'FF006100' }, bold: true };
                } else if (valStr.includes('fail')) {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
                    statusCell.font = { color: { argb: 'FF9C0006' }, bold: true };
                } else if (valStr.includes('skip')) {
                    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
                    statusCell.font = { color: { argb: 'FF9C6500' } };
                }
            }
            // Give border to the status cell even if empty, to look nice
            statusCell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
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

    // Set column widths
    sheet.columns.forEach((column, index) => {
        if (index === 0) column.width = 18; // ID
        else if (index === 1) column.width = 30; // Desc
        else if (index === 2) column.width = 45; // Steps
        else if (index === 3) column.width = 30; // Expected
        else if (index === passFailColumnIndex - 1) column.width = 15; // Pass/Fail
        else column.width = 15;
    });

    // Save
    await workbook.xlsx.writeFile(targetFile);
    console.log('[INFO] Styling complete!');
}

fixFormatting().catch(console.error);
