const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const issuesDir = path.join(__dirname, '..', 'issues');
const files = fs.readdirSync(issuesDir).filter(f => f.endsWith('.md')).sort();

console.log(`Found ${files.length} issue files.`);

for (const file of files) {
  const filePath = path.join(issuesDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract Title from first line
  const lines = content.split('\n');
  const titleLine = lines.find(l => l.startsWith('# '));
  const title = titleLine ? titleLine.replace(/^#\s*/, '').trim() : file;
  
  console.log(`\nCreating issue: "${title}" from ${file}...`);

  try {
    // Write body to a temp file to avoid shell escaping issues on Windows
    const tempFile = path.join(__dirname, 'temp_issue_body.txt');
    fs.writeFileSync(tempFile, content, 'utf-8');

    const cmd = `gh issue create --title "${title.replace(/"/g, '\\"')}" --body-file "${tempFile}"`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    console.log(`  -> Success: ${output.trim()}`);
    
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  } catch (err) {
    console.error(`  -> Failed creating issue ${title}:`, err.message);
  }
}

console.log('\nDone creating all issues!');
