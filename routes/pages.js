const router = require('express').Router();

const path = require('path');

router.get(['/', '/download/:id', '/admin'], (req, res) => {
    return res.sendFile(path.join(__dirname, '../public/main/main.html'));
});

router.get('/pages/:page', (req, res) => {
    return res.sendFile(path.join(__dirname, '../public', req.params.page, req.params.page + '.html'));
});

/*router.get('/download/:id', (req, res) => {
    return res.sendFile(path.join(__dirname, '../public/download/download.html'));
});

router.get('/admin', (req, res) => {
    return res.sendFile(path.join(__dirname, '../public/admin/admin.html'));
});*/

module.exports = router;