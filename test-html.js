const http = require('http');

console.log('Sending request to localhost:3001...');
http.get('http://localhost:3001', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Got HTML length:', data.length);
    if(data.includes('Error') || data.includes('Exception') || data.includes('App Error')) {
      console.log('FOUND ERROR TEXT IN DOM:');
      const errorText = data.substring(data.indexOf('App Error') - 50, data.indexOf('App Error') + 500);
      console.log(errorText);
    } else {
      console.log('No error boundary text found in static HTML. The crash happens in JS execution.');
    }
  });
}).on('error', err => console.error(err));
