// Script to remove console.log statements and clean up debug code
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');
let filesProcessed = 0;
let logsRemoved = 0;

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;

  // Count console.log statements
  const logMatches = content.match(/console\.log\([^)]*\);?/g);
  if (logMatches) {
    logsRemoved += logMatches.length;
  }

  // Remove console.log statements (keep console.error and console.warn)
  modified = modified.replace(/^[\s]*console\.log\([^)]*\);?\n?/gm, '');

  // Remove inline console.log that aren't on their own line
  modified = modified.replace(/console\.log\([^)]*\);?\s*/g, '');

  // Remove empty lines that were left behind (max 2 consecutive empty lines)
  modified = modified.replace(/\n\n\n+/g, '\n\n');

  if (content !== modified) {
    fs.writeFileSync(filePath, modified, 'utf8');
    filesProcessed++;
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      processFile(filePath);
    }
  });
}

console.log('🧹 Starting cleanup...');
walkDirectory(srcDir);
console.log(`✅ Cleanup complete!`);
console.log(`   - ${filesProcessed} files processed`);
console.log(`   - ${logsRemoved} console.log statements removed`);
