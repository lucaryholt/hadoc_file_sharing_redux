require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.static('public'));

app.use(require('./routes/html.js'));

app.use(require('./routes/files.js'));

app.use(require('./routes/admin.js'));

app.use(require('./routes/auth.js'));

const port = Number(process.env.ACCESS_PORT);

app.listen(port, (error) => {
    if (error) console.log('Error starting server.');
    else console.log('Server started on port', port);
});