const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const targetFile = process.argv[2];
if (!targetFile) {
    console.error("Please provide the path to the Excel file.");
    process.exit(1);
}
const excelPath = targetFile;
const outputExcelPath = targetFile;

async function runTests() {
    console.log(`[INFO] Reading Excel file from: ${excelPath}`);
    if (!fs.existsSync(excelPath)) {
        console.error(`[ERROR] File not found: ${excelPath}`);
        return;
    }

    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`[INFO] Found ${data.length} potential rows.`);
    
    let passCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const keys = Object.keys(row);
        const tcId = row[keys[0]];

        if (!tcId || !tcId.toString().startsWith('TC-')) {
            continue;
        }

        const steps = row['__EMPTY_1'] || '';
        const expected = row['__EMPTY_2'] || '';

        // Parsing
        const methodUrlMatch = steps.match(/(GET|POST|PUT|DELETE|PATCH)\s+.*?(http:\/\/\S+|\/\S+)/i);
        const method = methodUrlMatch ? methodUrlMatch[1].toUpperCase() : null;
        let url = methodUrlMatch ? methodUrlMatch[2] : null;

        const bodyMatch = steps.match(/Body:\s*(\{[\s\S]*?\})(?=\n\d+\.|$)/is) || steps.match(/Body:\s*(.*?)(?=\n\d+\.|$)/is);
        let body = bodyMatch ? bodyMatch[1].trim() : null;

        const expectedMatch = expected.match(/HTTP.*?(\d{3})/i) || expected.match(/Status Code = (\d{3})/i) || expected.match(/(\d{3})/);
        const expectedStatus = expectedMatch ? parseInt(expectedMatch[1], 10) : null;

        if (!method || !url || !expectedStatus) {
            console.log(`[SKIP] ${tcId}: Cannot parse Method, URL or Expected Status.`);
            row['__EMPTY_7'] = 'Skipped (Parse Error)';
            skipCount++;
            continue;
        }

        if (url.startsWith('/')) {
            url = 'http://localhost:8080/api/v1' + url;
        }

        if (url.includes('localhost:8080/') && !url.includes('/api/v1/')) {
            url = url.replace('localhost:8080/', 'localhost:8080/api/v1/');
        }

        let parsedBody = undefined;
        if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
            try {
                parsedBody = JSON.parse(body);
            } catch (e) {
                parsedBody = body;
            }
        }

        console.log(`[EXEC] ${tcId} | ${method} ${url}`);
        
        let actualStatus = 0;
        let responseBodyText = '';
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            if (parsedBody && typeof parsedBody === 'object') {
                options.body = JSON.stringify(parsedBody);
            } else if (parsedBody) {
                options.body = parsedBody;
            }

            const response = await fetch(url, options);
            actualStatus = response.status;
            responseBodyText = await response.text();
            
            try {
                responseBodyText = JSON.stringify(JSON.parse(responseBodyText));
            } catch(e) {}
            
        } catch (error) {
            console.log(`[ERROR] ${tcId} Failed to fetch: ${error.message}`);
            actualStatus = 500;
            responseBodyText = error.message;
        }

        if (actualStatus === expectedStatus) {
            console.log(`  => [PASS] Expected: ${expectedStatus}, Actual: ${actualStatus}`);
            row['__EMPTY_7'] = 'Passed';
            passCount++;
        } else {
            console.log(`  => [FAIL] Expected: ${expectedStatus}, Actual: ${actualStatus}`);
            row['__EMPTY_7'] = 'Failed';
            failCount++;
        }
        
        row['Actual Status'] = actualStatus;
        row['Actual Response'] = responseBodyText;
    }

    console.log(`\n[SUMMARY] Passed: ${passCount}, Failed: ${failCount}, Skipped: ${skipCount}`);

    const newSheet = xlsx.utils.json_to_sheet(data);
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
    
    xlsx.writeFile(newWorkbook, outputExcelPath);
    console.log(`[INFO] Results written to: ${outputExcelPath}`);
}

runTests().catch(console.error);
