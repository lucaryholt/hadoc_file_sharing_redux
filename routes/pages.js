const router = require('express').Router();

const path = require('path');

router.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, '../public/upload/upload.html'));
});

router.get('/download/:id', (req, res) => {
    return res.sendFile(path.join(__dirname, '../public/download/download.html'));
});

router.get('/admin', (req, res) => {
    return res.sendFile(path.join(__dirname, '../public/admin/admin.html'));
});

module.exports = router;