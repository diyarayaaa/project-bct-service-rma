const fs = require('fs');
const path = require('path');
const https = require('https');

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const repo = process.env.GITHUB_REPO; // format: "owner/repo"

if (!token || !repo) {
  console.log("Usage: set GITHUB_TOKEN=your_token and set GITHUB_REPO=owner/repo, then run this script.");
  process.exit(1);
}

const issuesDir = path.join(__dirname, '..', 'issues');
const files = fs.readdirSync(issuesDir).filter(f => f.endsWith('.md')).sort();

function createIssue(title, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ title, body });
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repo}/issues`,
      method: 'POST',
      headers: {
        'User-Agent': 'NodeJS-Script',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const parsed = JSON.parse(data);
          resolve(parsed.html_url);
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log(`Creating ${files.length} issues in GitHub repo: ${repo}...`);
  for (const file of files) {
    const filePath = path.join(issuesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const titleLine = lines.find(l => l.startsWith('# '));
    const title = titleLine ? titleLine.replace(/^#\s*/, '').trim() : file;

    try {
      const url = await createIssue(title, content);
      console.log(`✅ Created: ${title} -> ${url}`);
      // Sleep 500ms to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`❌ Failed: ${title}`, err.message);
    }
  }
  console.log('\n🎉 Finished creating all issues on GitHub!');
}

run();
