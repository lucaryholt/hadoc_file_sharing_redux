const repo = require('./Repo.js');
const request = require('request');

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
                        // TODO log this
                    });
            });
        });
}

function timeoutRefreshTokens() {
    repo.find('refreshTokens', {})
        .then(result => {
            const timestamp = new Date().getTime();
            const tokensTimedout = result.filter(token => {
                if ((timestamp - token.uploadTime) > Number(process.env.REFRESH_TOKEN_ACTIVE_TIME)) {
                    return token;
                }
            });
            tokensTimedout.map(token => {
                repo.deleteOne('refreshTokens', { refreshToken: token.refreshToken })
                    .then(result => {
                        // TODO log this
                    });
            });
        });
}

function startHandlers() {
    setInterval(timeoutUploads, 300000);
    setInterval(timeoutRefreshTokens, 28800000);
}

module.exports = startHandlers;