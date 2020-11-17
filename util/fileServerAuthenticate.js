const request = require('request');

function authenticateFileServer() {
    request.post({
        url: process.env.FILE_SERVER_URL + '/authenticate',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            authkey: process.env.FILE_SERVER_AUTHKEY
        })
    }, (error, response, body) => {
        process.env.FILE_SERVER_ACCESSTOKEN = JSON.parse(response.body).accessToken;
    });
}

module.exports = authenticateFileServer;