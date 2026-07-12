const xlsx = require('xlsx');
const targetFile = process.argv[2];

if (!targetFile) {
    console.error("Please provide the path to the Excel file.");
    process.exit(1);
}

try {
    console.log(`[INFO] Stripping formatting for: ${targetFile}`);
    const wb = xlsx.readFile(targetFile);
    xlsx.writeFile(wb, targetFile);
    console.log(`[INFO] Successfully stripped formatting for: ${targetFile}`);
} catch (e) {
    console.error(`[ERROR] Failed to strip formatting for ${targetFile}:`, e);
}
