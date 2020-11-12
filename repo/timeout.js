const repo = require('./repo.js');
const request = require('request');
const fs = require('fs');
const path = require('path');

const timeoutLogStream = fs.createWriteStream(path.join(__dirname, '../timeout.log'), { flags: 'a' });

function timeoutUploads() {
    repo.find('uploads', {})
        .then(result => {
            const timestamp = new Date().getTime();
            const uploadsTimedout = result.filter(upload => {
                if ((timestamp - upload.uploadTime) > Number(process.env.FILE_ACTIVE_TIME)) {
                    return upload;
                }
            });
            uploadsTimedout.map(upload => {
                upload.files.map(file => {
                    request.delete({
                        url: process.env.FILE_SERVER_URL + '/file/' + file.filename,
                        headers: {
                            'Authorization': 'Bearer ' + process.env.FILE_SERVER_ACCESSTOKEN
                        }
                    });
                });
                repo.deleteOne('uploads', { id: upload.id })
                    .then(result => {
                        log(result, upload);
                    });
            });
        });
}

function timeoutRefreshTokens() {
    repo.find('refreshTokens', {})
        .then(result => {
            const timestamp = new Date().getTime();
            const tokensTimedout = result.filter(token => {
                if ((timestamp - token.authTime) > Number(process.env.REFRESH_TOKEN_ACTIVE_TIME)) {
                    return token;
                }
            });
            tokensTimedout.map(token => {
                repo.deleteOne('refreshTokens', { refreshToken: token.refreshToken })
                    .then(result => {
                        log(result, token);
                    });
            });
        });
}

function log(result, object) {
    timeoutLogStream.write(new Date().toUTCString() + '. Deleted ' + result.deletedCount + '. Deleted info:' + JSON.stringify(object) + '\n');
}

function startHandlers() {
    timeoutUploads();
    timeoutRefreshTokens();
    setInterval(timeoutUploads, 300000);
    setInterval(timeoutRefreshTokens, 300000);
}

module.exports = startHandlers;