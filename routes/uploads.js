const router = require('express').Router();

const request = require('request');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const multer = require('multer');
const repo = require('../util/repo.js');
const mailer = require('../util/mailer.js');
const fileServerAuthenticator = require('../util/fileServerAuthenticate.js');
const authorizeUser = require('../util/jwtAuthenticate.js').authorizeUser;

const upload = multer({
    dest: path.join(__dirname, '../temp')
});

fileServerAuthenticator();

router.get('/uploads/:id', (req, res) => {
    repo.find('uploads', { id: req.params.id })
        .then(result => {
            if (result.length === 0) return res.status(404).send({ message: 'Upload could not be found.' });
            const date = new Date(result[0].uploadTime + Number(process.env.FILE_ACTIVE_TIME));
            result[0].expire = date.toDateString() + ' : ' + date.toLocaleTimeString();
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
                        fileServerAuthenticator();
                        return res.status(500).send({ error: 'Error authenticating, try again.' })
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

// TODO change rate limiting to once every minute or something like that

router.post('/uploads', upload.array('files'), (req, res) => {
    let totalSize = 0;
    req.files.map(file => {
        totalSize = totalSize + file.size;
    });
    if (totalSize > 50 * 1024 * 1024) return res.status(413).send({ message: 'Files are too large. Max total size is 50 MB.' });

    const uploadInfoObject = {
        id: uuid.v4(),
        uploadTime: new Date().getTime(),
        message: req.body.message,
        files: []
    }

    if (req.body.username !== 'null') {
        uploadInfoObject.uploader = req.body.username;
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
            fileServerAuthenticator();
            req.files.map(file => {
                fs.unlinkSync(path.join(__dirname, '../temp', file.filename));
            });
            return res.status(500).send({ error: 'Error authenticating, try again.' });
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
                mailer.sendUploadEmail(req.body.receiver, req.body.message, uploadInfoObject.id);
            }

            repo.insert('uploads', uploadInfoObject)
                .then(result => {
                    return res.status(200).send({ id: uploadInfoObject.id });
                });
        }
    });
});

router.delete('/uploads/:id', authorizeUser, async (req, res) => {
    try {
        const upload = await repo.find('uploads', { id: req.params.id });

        if (upload[0] !== undefined) {
            upload[0].files.map(file => {
                request.delete( {
                    url: process.env.FILE_SERVER_URL + '/file/' + file.filename,
                    headers: {
                        'Authorization': 'Bearer ' + process.env.FILE_SERVER_ACCESSTOKEN
                    }
                });
            });
        } else return res.status(404).send({ message: 'Could not find upload.' });

        await repo.deleteOne('uploads', { id: req.params.id });

        return res.status(200).send({ message: 'Files deleted' });
    } catch (e) {
        return res.status(500).send({ message: 'Internal Server Error' });
    }
});

module.exports = router;