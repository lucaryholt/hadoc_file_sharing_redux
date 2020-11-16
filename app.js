require('dotenv').config();
require('./repo/timeout.js')();

const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.static('public'));
app.use(express.json());

// Routes

app.use(require('./routes/files.js'));

app.use(require('./routes/restricted.js'));

app.use(require('./routes/auth.js'));

app.use(require('./routes/pages.js'));

const port = Number(process.env.ACCESS_PORT);

app.listen(port, (error) => {
    if (error) console.log('Error starting server.');
    else console.log('Server started on port', port);
});