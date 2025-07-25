const https = require('https');
const exec = require('exec');
const PORT = 3389

// Dummy certificate and key for HTTPS (replace with real certificates in production)
const options = {
  key: 'your-private-key',
  cert: 'your-certificate'
};

// Basic rate limiting
let requestCount = 0;
const MAX_REQUESTS = 10;
const TIME_FRAME = 60000; // 1 minute
setInterval(() => { requestCount = 0; }, TIME_FRAME);

var deployServer = https.createServer(options, function(request, response) {
  if (request.url.search(/pull\/?$/i) > 0) {
    if (requestCount >= MAX_REQUESTS) {
      response.writeHead(429);
      response.end('Too Many Requests.');
      return;
    }
    requestCount++;

    var commands = ['git pull', 'npm run server'].join(' && ');
    exec(commands, function(err, out, code) {
      if (err instanceof Error) {
        response.writeHead(500)
        response.end('Server Internal Error.')
        throw err
      }
      process.stderr.write(err)
      process.stdout.write(out)
      response.writeHead(200)
    })
  } else {
    response.writeHead(404)
    response.end('Not Found.')
  }
})

deployServer.listen(PORT);
