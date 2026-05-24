const fs = require('fs');
const path = require('path');

function scanDir(dir, baseDir = dir) {
  let items = fs.readdirSync(dir);
  let result = [];
  for (const item of items) {
    // Skip .git, node_modules, public (output)
    if (['.git', 'node_modules', 'public'].includes(item)) continue;
    let fullPath = path.join(dir, item);
    let relPath = path.relative(baseDir, fullPath);
    let stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      result.push({ type: 'folder', name: relPath, children: scanDir(fullPath, baseDir) });
    } else {
      result.push({ type: 'file', name: relPath });
    }
  }
  return result;
}

function generateHtml(tree) {
  function walk(nodes) {
    let html = '<ul>';
    for (const node of nodes) {
      if (node.type === 'folder') {
        html += `<li><strong>${node.name}/</strong>${walk(node.children)}</li>`;
      } else {
        html += `<li>${node.name}</li>`;
      }
    }
    html += '</ul>';
    return html;
  }
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <title>Repo Structure</title>
    </head>
    <body>
      <h1>Repository Structure</h1>
      ${walk(tree)}
      <p>Generated automatically from latest commit.</p>
    </body>
  </html>
  `;
}

const tree = scanDir('.');
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/index.html', generateHtml(tree));
console.log("Site generated in ./public/index.html");