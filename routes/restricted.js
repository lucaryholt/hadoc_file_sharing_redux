const router = require('express').Router();
const path = require('path');
const authenticator = require('../util/jwtAuthenticate.js');
const repo = require('../util/repo.js');

router.get('/logintest', authenticator, (req, res) => {
     return res.status(200).send({ message: 'Logged in.' });
});

router.get('/restricted/uploads', authenticator, async (req, res) => {
    try {
        let query = null;
        if (req.user.roles.includes('admin')) query = {};
        else query = { uploader: req.user.name };

        const uploads = await repo.find('uploads', query);

        if (uploads === undefined) return res.sendStatus(500);

        return res.status(200).send(uploads);
    } catch (e) {
        return res.status(500).send({ message: 'Internal Server Error.' });
    }
});

module.exports = router;