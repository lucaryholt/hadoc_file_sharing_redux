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
const settings = require('../settings.json');

router.get('/files/:id', (req, res) => {
    repo.find('uploads', { id: req.params.id })
        .then(result => {
            request({
                url: settings.fileServerLink + '/file/' + result[0].filename
            }, (error, response, body) => {
                const data = new Uint8Array(JSON.parse(response.body).file.data);

                fs.writeFileSync(path.join(__dirname, '../temp', result[0].originalFilename), data);
                res.download(path.join(__dirname, '../temp', result[0].originalFilename), (error) => {
                    if (!error) {
                        fs.unlinkSync(path.join(__dirname, '../temp', result[0].originalFilename));
                    }
                });
            });
        });
});

router.post('/files', upload.single('file'), (req, res) => {
    const id = uuid.v4();
    const file = {
        id,
        originalFilename: req.file.originalname,
        uploadTime: new Date().getTime(),
        message: req.body.message
    }

    request.post({
        url: settings.fileServerLink + '/file',
        formData: {
            file: fs.createReadStream(path.join(__dirname, '../temp', req.file.filename)),
            filetype: req.file.mimetype,
            filename: 'file'
        }
    }, (error, response, body) => {
        fs.unlinkSync(path.join(__dirname, '../temp', req.file.filename));
        const responseBody = JSON.parse(response.body);

        file.filename = responseBody.filename;
        file.encoding = responseBody.encoding;
        file.mimetype = responseBody.mimetype;

        repo.insert('uploads', file)
            .then(result => {
                return res.send({ id });
            });
    });
});

module.exports = router;