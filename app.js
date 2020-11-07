const express = require('express');
const app = express();

app.use(express.static('public'));

app.use(require('./routes/html.js'));

app.use(require('./routes/files.js'));

const port = process.env.PORT ? process.env.PORT : 80;

app.listen(port, (error) => {
    if (error) console.log('Error starting server.');
    else console.log('Server started on port', port);
});