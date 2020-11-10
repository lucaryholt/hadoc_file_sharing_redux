const express = require('express');
const router = express.Router();

router.use(express.json());

router.post('/login', (req, res) => {
     const username = req.body.username;
     const password = req.body.password;

     console.log(username, password);

     return res.send('OK');
});

module.exports = router;