require('dotenv').config();
require('./util/timeout.js')();

const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const app = express();
app.use(express.static('public'));
app.use(express.json());

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

const rateLimiter = require('express-rate-limit');

const authLimit = rateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 100
});

const restrictedLimit = rateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 50
});

const uploadsLimit = rateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 70
});

app.use('/auth', authLimit);
app.use('/restricted', restrictedLimit);
app.use('/uploads', uploadsLimit);

// Routes
app.use(require('./routes/uploads.js'));

app.use(require('./routes/restricted.js'));

app.use(require('./routes/auth.js'));

app.use(require('./routes/admin.js'));

app.use(require('./routes/pages.js'));

try {
    const https = require('https');

    const sslPort = Number(process.env.SSL_ACCESS_PORT);

    const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, 'utf-8');
    const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, 'utf-8');

    const credentials = { key: privateKey, cert: certificate };

    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(sslPort, (error) => {
        if (error) console.log('Error starting HTTPS server.');
        else console.log('HTTPS server started on port', sslPort);
    });
} catch (e) {
    console.log('Could not start HTTPS server.');
}

const http = require('http');

const port = Number(process.env.ACCESS_PORT);

const httpServer = http.createServer(app);

httpServer.listen(port, (error) => {
    if (error) console.log('Error starting HTTP server.');
    else console.log('HTTP server started on port', port);
});