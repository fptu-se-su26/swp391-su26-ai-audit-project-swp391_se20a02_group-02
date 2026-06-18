const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const replacements = [
    { regex: /\bbg-white\b(?!\s+dark:bg-)/g, replacement: 'bg-white dark:bg-slate-900' },
    { regex: /\bbg-gray-50\b(?!\s+dark:bg-)/g, replacement: 'bg-gray-50 dark:bg-slate-950' },
    { regex: /\bbg-gray-100\b(?!\s+dark:bg-)/g, replacement: 'bg-gray-100 dark:bg-slate-800' },
    { regex: /\bbg-slate-50\b(?!\s+dark:bg-)/g, replacement: 'bg-slate-50 dark:bg-slate-950' },
    { regex: /\bbg-slate-100\b(?!\s+dark:bg-)/g, replacement: 'bg-slate-100 dark:bg-slate-800' },
    
    { regex: /\btext-gray-900\b(?!\s+dark:text-)/g, replacement: 'text-gray-900 dark:text-gray-100' },
    { regex: /\btext-gray-800\b(?!\s+dark:text-)/g, replacement: 'text-gray-800 dark:text-gray-200' },
    { regex: /\btext-gray-700\b(?!\s+dark:text-)/g, replacement: 'text-gray-700 dark:text-gray-300' },
    { regex: /\btext-gray-600\b(?!\s+dark:text-)/g, replacement: 'text-gray-600 dark:text-gray-400' },
    
    { regex: /\btext-slate-900\b(?!\s+dark:text-)/g, replacement: 'text-slate-900 dark:text-slate-100' },
    { regex: /\btext-slate-800\b(?!\s+dark:text-)/g, replacement: 'text-slate-800 dark:text-slate-200' },
    { regex: /\btext-slate-700\b(?!\s+dark:text-)/g, replacement: 'text-slate-700 dark:text-slate-300' },
    { regex: /\btext-slate-600\b(?!\s+dark:text-)/g, replacement: 'text-slate-600 dark:text-slate-400' },

    { regex: /\bborder-gray-200\b(?!\s+dark:border-)/g, replacement: 'border-gray-200 dark:border-slate-700' },
    { regex: /\bborder-gray-300\b(?!\s+dark:border-)/g, replacement: 'border-gray-300 dark:border-slate-600' },
    { regex: /\bborder-slate-200\b(?!\s+dark:border-)/g, replacement: 'border-slate-200 dark:border-slate-700' },
    { regex: /\bborder-slate-300\b(?!\s+dark:border-)/g, replacement: 'border-slate-300 dark:border-slate-600' },
];

let changedFiles = 0;

walkDir('./src', function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content;
        
        replacements.forEach(({regex, replacement}) => {
            newContent = newContent.replace(regex, replacement);
        });

        if (newContent !== content) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            changedFiles++;
        }
    }
});

console.log(`Updated ${changedFiles} files with dark mode classes.`);
