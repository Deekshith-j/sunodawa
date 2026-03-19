const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'POST' && req.url === '/error') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      console.log('\n=======================================');
      console.log('🚨 REACT APP CRASH LOG RECEIVED 🚨');
      console.log('=======================================');
      console.log(body);
      console.log('=======================================\n');
      res.end('ok');
      // Tell server to exit after receiving error so we can proceed
      setTimeout(() => process.exit(0), 1000);
    });
  } else {
    res.end('ok');
  }
});

server.listen(3003, () => {
  console.log('Error catching server running on port 3003');
  
  // Trigger a request to the dev server to render the page and execute the JS
  setTimeout(() => {
    console.log('Triggering page load on localhost:3002...');
    // We just need to hit it to trigger the JS, but actually we need Chrome to execute the JS
    // Since puppeteer failed, we'll try using Start-Process in powershell to open Edge
    const { exec } = require('child_process');
    exec('start http://localhost:3002');
  }, 1000);
});
