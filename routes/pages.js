const router = require('express').Router();
const path = require('path');

router.get(['/', '/download/:id', '/userpage', '/about', '/confirm-email/:id', '/resetpassword/:id', '/admin'], (req, res) => {
    return res.sendFile(path.join(__dirname, '../public/main/main.html'));
});

router.get('/pages/:page', (req, res) => {
    return res.sendFile(path.join(__dirname, '../public', req.params.page, req.params.page + '.html'));
});

router.get('/*', (req, res) => {
    return res.redirect('/');
});

module.exports = router;