const xlsx = require('xlsx');
const xl = require('excel4node');
const targetFile = process.argv[2];

if (!targetFile) {
    console.error("Please provide the path to the Excel file.");
    process.exit(1);
}

try {
    console.log(`[INFO] Re-styling with excel4node: ${targetFile}`);
    const wbIn = xlsx.readFile(targetFile);
    const sheetIn = wbIn.Sheets[wbIn.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheetIn, { header: 1 });

    // Find actual header row (contains 'Mã Test Case' or 'Test Case ID')
    let actualHeaderIndex = -1;
    for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        if (row.some(c => c && (c.toString().includes('Mã Test Case') || c.toString().includes('Test Case ID')))) {
            actualHeaderIndex = i;
            break;
        }
    }

    if (actualHeaderIndex === -1) {
        console.error("Could not find actual header row.");
        process.exit(1);
    }

    // Prepare data
    const headers = rawData[actualHeaderIndex].map(h => {
        const val = h ? h.toString() : '';
        if (val.toLowerCase().includes('__empty')) return '';
        if (val.toLowerCase().includes('lần 1') || val.toLowerCase().includes('round 1')) return 'Pass/Fail';
        return val;
    });

    const dataRows = rawData.slice(actualHeaderIndex + 1);

    // Create new workbook with excel4node
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('Sheet1');

    // Styles
    const headerStyle = wb.createStyle({
        font: { bold: true, color: 'FFFFFF' },
        fill: { type: 'pattern', patternType: 'solid', fgColor: '4472C4' },
        alignment: { vertical: 'center', horizontal: 'center' },
        border: {
            left: { style: 'thin', color: '000000' },
            right: { style: 'thin', color: '000000' },
            top: { style: 'thin', color: '000000' },
            bottom: { style: 'thin', color: '000000' }
        }
    });

    const normalStyle = wb.createStyle({
        alignment: { vertical: 'center', wrapText: true },
        border: {
            left: { style: 'thin', color: '000000' },
            right: { style: 'thin', color: '000000' },
            top: { style: 'thin', color: '000000' },
            bottom: { style: 'thin', color: '000000' }
        }
    });

    const passStyle = wb.createStyle({
        font: { bold: true, color: '006100' },
        fill: { type: 'pattern', patternType: 'solid', fgColor: 'C6EFCE' },
        alignment: { vertical: 'center', wrapText: true },
        border: { left: { style: 'thin' }, right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } }
    });

    const failStyle = wb.createStyle({
        font: { bold: true, color: '9C0006' },
        fill: { type: 'pattern', patternType: 'solid', fgColor: 'FFC7CE' },
        alignment: { vertical: 'center', wrapText: true },
        border: { left: { style: 'thin' }, right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } }
    });

    const skipStyle = wb.createStyle({
        font: { color: '9C6500' },
        fill: { type: 'pattern', patternType: 'solid', fgColor: 'FFEB9C' },
        alignment: { vertical: 'center', wrapText: true },
        border: { left: { style: 'thin' }, right: { style: 'thin' }, top: { style: 'thin' }, bottom: { style: 'thin' } }
    });

    let passFailCol = -1;
    let actualStatusCol = -1;

    // Write Headers
    for (let c = 0; c < headers.length; c++) {
        const val = headers[c];
        ws.cell(1, c + 1).string(val).style(headerStyle);
        if (val === 'Pass/Fail') passFailCol = c;
        if (val.toLowerCase() === 'actual status') actualStatusCol = c;
    }

    // Write Data
    for (let r = 0; r < dataRows.length; r++) {
        const row = dataRows[r];
        for (let c = 0; c < headers.length; c++) {
            const val = row[c] !== undefined ? row[c].toString() : '';
            const cell = ws.cell(r + 2, c + 1);
            
            let currentStyle = normalStyle;

            if (c === passFailCol) {
                if (val.toLowerCase().includes('pass')) currentStyle = passStyle;
                else if (val.toLowerCase().includes('fail')) currentStyle = failStyle;
                else if (val.toLowerCase().includes('skip')) currentStyle = skipStyle;
            }

            if (val && !isNaN(val)) {
                cell.number(Number(val)).style(currentStyle);
            } else {
                cell.string(val).style(currentStyle);
            }
            
            // Override font color for Actual Status
            if (c === actualStatusCol && val) {
                const num = Number(val);
                if (num === 200 || num === 201) {
                    cell.style({ font: { bold: true, color: '006100' } });
                } else if (num >= 400) {
                    cell.style({ font: { bold: true, color: '9C0006' } });
                }
            }
        }
    }

    // Set widths
    ws.column(1).setWidth(18);
    ws.column(2).setWidth(30);
    ws.column(3).setWidth(45);
    ws.column(4).setWidth(30);
    if (passFailCol > -1) ws.column(passFailCol + 1).setWidth(15);

    wb.write(targetFile);
    console.log(`[INFO] Successfully restyled: ${targetFile}`);

} catch (e) {
    console.error(`[ERROR] Failed: ${e}`);
}
