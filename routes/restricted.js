const router = require('express').Router();
const path = require('path');
const authorizeUser = require('../util/jwtAuthenticate.js').authorizeUser;
const repo = require('../util/repo.js');

router.get('/logintest', authorizeUser, (req, res) => {
     return res.status(200).send({ message: 'Logged in.' });
});

router.get('/restricted/uploads', authorizeUser, async (req, res) => {
    try {
        const query = req.user.roles.includes('admin') ? {} : { uploader: req.user.name };

        const uploads = await repo.find('uploads', query);

        return res.status(200).send(uploads);
    } catch (e) {
        return res.status(500).send({ message: 'Internal Server Error.' });
    }
});

module.exports = router;