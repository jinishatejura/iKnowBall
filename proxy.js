// simple proxy server to get around CORS issues with football-data.org
var http = require('http');
var https = require('https');

var PORT = 3001;
var API_BASE = 'https://api.football-data.org';

var server = http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    var targetUrl = API_BASE + req.url;
    var headers = { 'X-Auth-Token': req.headers['x-auth-token'] || '' };

    https.get(targetUrl, { headers: headers }, function (proxyRes) {
        res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        proxyRes.pipe(res);
    }).on('error', function (err) {
        res.writeHead(502);
        res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
    });
});

server.listen(PORT, function () {
    console.log('CORS Proxy running at http://localhost:' + PORT);
    console.log('Proxying requests to ' + API_BASE);
});
