const router = require('express').Router();

const request = require('request');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const multer = require('multer');
const repo = require('../repo/repo.js');
const mailer = require('../mail/mailer.js');

const upload = multer({
    dest: path.join(__dirname, '../temp')
});

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
        process.env.FILE_SERVER_ACCESSTOKEN = JSON.parse(response.body).accessToken;
    });
}

router.get('/uploads/:id', (req, res) => {
    repo.find('uploads', { id: req.params.id })
        .then(result => {
            if (result.length === 0) return res.status(404).send({ message: 'Upload could not be found.' });
            return res.status(200).send(result[0]);
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
                        'Authorization': 'Bearer ' + process.env.FILE_SERVER_ACCESSTOKEN
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
                return res.status(404).send({ message: 'Upload could not be found.' });
            }
        });
});

router.post('/uploads', upload.array('files'), (req, res) => {
    const id = uuid.v4();

    const uploadInfoObject = {
        id,
        uploadTime: new Date().getTime(),
        message: req.body.message,
        files: []
    }

    let uploadedFileDataArray = []

    req.files.map(file => {
        uploadedFileDataArray.push(fs.createReadStream(path.join(__dirname, '../temp', file.filename)));
    });

    request.post({
        url: process.env.FILE_SERVER_URL + '/files',
        formData: {
            files: uploadedFileDataArray
        },
        headers: {
            'Authorization': 'Bearer ' + process.env.FILE_SERVER_ACCESSTOKEN
        }
    }, (error, response, body) => {
        if (response.statusCode === 403 || response.statusCode === 401) {
            authenticateFileServer();
            return res.send({ error: 'Error authenticating, try again.' });
        } else {
            const files = JSON.parse(response.body).files;

            req.files.map(file => {
                fs.unlinkSync(path.join(__dirname, '../temp', file.filename));
                files.map(file0 => {
                    if (file.filename === file0.originalName) {
                        uploadInfoObject.files.push({
                            filename: file0.filename,
                            originalName: file.originalname,
                        });
                    }
                });
            });

            if (req.body.receiver !== '') {
                uploadInfoObject.receiver = req.body.receiver;
                mailer.sendUploadEmail(req.body.receiver, req.body.message, id);
            }

            repo.insert('uploads', uploadInfoObject)
                .then(result => {
                    return res.send({ id });
                });
        }
    });
});

module.exports = router;