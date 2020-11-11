require('dotenv').config();
require('./repo/timeout.js')();

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const morgan = require('morgan');

app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.static('public'));

app.use(require('./routes/pages.js'));

app.use(require('./routes/files.js'));

app.use(require('./routes/admin.js'));

app.use(require('./routes/auth.js'));

const port = Number(process.env.ACCESS_PORT);

app.listen(port, (error) => {
    if (error) console.log('Error starting server.');
    else console.log('Server started on port', port);
});