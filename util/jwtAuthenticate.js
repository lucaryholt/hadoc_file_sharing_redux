const jwt = require('jsonwebtoken');

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

function authenticateAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token === null) return res.status(401).send({ message: 'No token received.' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) return res.status(403).send({ message: 'Not correct token.' });
        else if (!user.roles.includes('admin')) return res.status(403).send({ message: 'Not admin.' });
        req.user = user;
        next();
    });
}

module.exports = {
    authenticateUser,
    authenticateAdmin
};