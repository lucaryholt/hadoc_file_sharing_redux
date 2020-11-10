const express = require('express');
const router = express.Router();

const repo = require('../repo/Repo.js');

const jwt = require('jsonwebtoken');
const path = require('path');

function authenticateUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === null) return res.status(401).send({ message: 'No token received.' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) return res.status(403).send({ message: 'Not correct token.' });
        req.user = user;
        next();
    });
}

router.get('/logintest', authenticateUser, (req, res) => {
     return res.status(200).send({ message: 'Logged in.' });
});

router.get('/admin/uploads', authenticateUser, async (req, res) => {
    try {
        const uploads = await repo.find('uploads', {});

        if (uploads === undefined) return res.sendStatus(500);

        return res.status(200).send(uploads);
    } catch (e) {
        return res.status(500).send({ message: 'Internal Server Error.' });
    }
});

module.exports = router;