const express = require('express');
const router = express.Router();

const repo = require('../repo/Repo.js');

router.use((req, res, next) => {
    next();
});

router.get('/admin/uploads', (req, res) => {

});

module.exports = router;