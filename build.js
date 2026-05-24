const fs = require('fs');
const path = require('path');

// Defined sections in order
const sections = [
  { id: 'what-is-redis', title: 'What is Redis and Why It Exists?', folder: '01-What is Redis and Why It Exists ?' },
  { id: 'redis-setup', title: 'Redis Setup with Docker and Node.js', folder: '02-Redis-Setup' },
  { id: 'site-banner-apis', title: 'Site Banner APIs with Redis', folder: '03-Site-Banner-APIs' },
  { id: 'otp-verification', title: 'OTP Verification Service with Redis', folder: '04-OTP-Verification' },
  { id: 'user-profile', title: 'User Profile Storage with Redis', folder: '05-User-Profile' },
  { id: 'email-queues', title: 'Email Queues Drawbacks', folder: '06-Email-Queues' },
  { id: 'bullmq-queue', title: 'BullMQ Queue Infrastructure', folder: '07-BullMQ-Queue-Infrastructure' },
  { id: 'pub-sub', title: 'Redis Pub/Sub (Publish/Subscribe) Example', folder: '08-Pub-Sub-With-Redis' },
  { id: 'live-leaderboard', title: 'Redis Live Leaderboard', folder: '09-Live-Dashboard-Assignment' }
];

function compile() {
  console.log('Starting Redis documentation compilation...');

  let markdownScripts = '';
  
  sections.forEach((section) => {
    const readmePath = path.join(__dirname, section.folder, 'README.md');
    let mdContent = '';
    
    if (fs.existsSync(readmePath)) {
      mdContent = fs.readFileSync(readmePath, 'utf8');
      console.log(`Successfully read: ${section.folder}/README.md`);
    } else {
      console.warn(`WARNING: README.md not found in folder: ${section.folder}`);
    }
    
    // Safely escape </script> tags if they occur in markdown
    const escapedMd = mdContent.replace(/<\/script>/g, '<\\/script>');

    // Encode folder name to be URL-safe for relative path references
    const encodedFolder = encodeURIComponent(section.folder);
    
    markdownScripts += `    <script type="text/markdown" id="md-${section.id}" data-dir="${encodedFolder}/" data-title="${section.title}">\n${escapedMd}\n    </script>\n`;
  });

  // Read the HTML template
  const templatePath = path.join(__dirname, 'index.html.template');
  let htmlOutput = '';
  
  if (fs.existsSync(templatePath)) {
    const template = fs.readFileSync(templatePath, 'utf8');
    htmlOutput = template.replace('<!-- {{MARKDOWN_SECTIONS_PLACEHOLDER}} -->', markdownScripts);
  } else {
    console.error('index.html.template not found. Please create it first.');
    process.exit(1);
  }
  
  const outputPath = path.join(__dirname, 'index.html');
  fs.writeFileSync(outputPath, htmlOutput, 'utf8');
  console.log(`Successfully generated documentation: ${outputPath}`);
}

compile();
