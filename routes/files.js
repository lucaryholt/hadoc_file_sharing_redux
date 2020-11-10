const router = require('express').Router();

const path = require('path');
const fs = require('fs');
const uuid = require('uuid');

const multer = require('multer');
const upload = multer({
    dest: path.join(__dirname, '../temp')
});
const request = require('request');

const repo = require('../repo/Repo.js');

let accessToken = null;

authenticateFileServer();

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
        accessToken = JSON.parse(response.body).accessToken;
        process.env.FILE_SERVER_ACCESSTOKEN = JSON.parse(response.body).accessToken;
    });
}

router.get('/uploads/:id', (req, res) => {
    repo.find('uploads', { id: req.params.id })
        .then(result => {
            return res.send(result[0]);
        });
});

router.get('/uploads/:id/:filename', (req, res) => {
    repo.find('uploads', { id: req.params.id })
        .then(result => {
            const file = result[0].files.find(file => file.originalName === req.params.filename);
            if (file !== undefined) {
                request({
                    url: process.env.FILE_SERVER_URL + '/file/' + file.filename,
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                }, (error, response, body) => {
                    if (response.statusCode === 403 || response.statusCode === 401) {
                        authenticateFileServer();
                        return res.send({ error: 'Error authenticating, try again.' })
                    } else {
                        const data = new Uint8Array(JSON.parse(response.body).file.data);

                        fs.writeFileSync(path.join(__dirname, '../temp', file.originalName), data);
                        res.download(path.join(__dirname, '../temp', file.originalName), (error) => {
                            if (!error) {
                                fs.unlinkSync(path.join(__dirname, '../temp', file.originalName));
                            }
                        });
                    }
                });
            } else {
                return res.sendStatus(404);
            }
        });
});

router.post('/uploads', upload.array('files'), (req, res) => {
    const id = uuid.v4();

    const fileObject = {
        id,
        uploadTime: new Date().getTime(),
        message: req.body.message,
        files: []
    }

    let filesReadStreams = []

    req.files.map(file => {
        filesReadStreams.push(fs.createReadStream(path.join(__dirname, '../temp', file.filename)));
    });

    request.post({
        url: process.env.FILE_SERVER_URL + '/files',
        formData: {
            files: filesReadStreams,
            filetype: 'file.mimetype', // maybe don't need filetype & filename
            filename: 'file'
        },
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    }, (error, response, body) => {
        if (response.statusCode === 403 || response.statusCode === 401) {
            authenticateFileServer();
            return res.send({ error: 'Error authenticating, try again.' })
        } else {
            const files = JSON.parse(response.body).files;

            req.files.map(file => {
                fs.unlinkSync(path.join(__dirname, '../temp', file.filename));
                files.map(file0 => {
                    if (file.filename === file0.originalName) {
                        fileObject.files.push({
                            filename: file0.filename,
                            originalName: file.originalname,
                        });
                    }
                });
            });

            repo.insert('uploads', fileObject)
                .then(result => {
                    return res.send({ id });
                });
        }
    });
});

module.exports = router;