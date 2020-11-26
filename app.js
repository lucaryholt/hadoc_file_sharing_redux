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
app.use(require('./routes/files.js'));

app.use(require('./routes/restricted.js'));

app.use(require('./routes/auth.js'));

app.use(require('./routes/admin.js'));

app.use(require('./routes/pages.js'));

const port = Number(process.env.ACCESS_PORT);

app.listen(port, (error) => {
    if (error) console.log('Error starting server.');
    else console.log('Server started on port', port);
});