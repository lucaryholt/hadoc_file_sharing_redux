const router = require('express').Router();

const path = require('path');

router.get(['/', '/download/:id', '/userpage'], (req, res) => {
    return res.sendFile(path.join(__dirname, '../public/main/main.html'));
});

router.get('/pages/:page', (req, res) => {
    return res.sendFile(path.join(__dirname, '../public', req.params.page, req.params.page + '.html'));
});

module.exports = router;