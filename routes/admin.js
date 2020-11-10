const express = require('express');
const router = express.Router();

const repo = require('../repo/Repo.js');

const jwt = require('jsonwebtoken');
const path = require('path');

function authenticateUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

router.get('/admin/uploads', authenticateUser, async (req, res) => {
    try {
        const uploads = await repo.find('uploads', {});

        if (uploads === undefined) return res.sendStatus(500);

        return res.status(200).send(uploads);
    } catch (e) {
        return res.sendStatus(500);
    }
});

module.exports = router;