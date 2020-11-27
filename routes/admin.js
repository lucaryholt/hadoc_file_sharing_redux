const router = require('express').Router();
const authorizeAdmin = require('../util/jwtAuthenticate.js').authorizeAdmin;
const repo = require('../util/repo.js');

router.get('/admin/users', authorizeAdmin, async (req, res) => {
    try {
        const users = await repo.find('users', {});

        if (users.length === 0) return res.status(404).send({ message: 'No users found.' });

        const filteredUsers = users.map(user => {
            return {
                id: user.id,
                username: user.username,
                roles: user.roles
            };
        });

        return res.status(200).send({ message: 'Found ' + filteredUsers.length + 'users', users: filteredUsers });
    } catch (e) {
        return res.status(500).send({ message: 'Internal Server Error' });
    }
});

router.delete('/admin/users/:id', authorizeAdmin, async (req, res) => {
    try {
        repo.deleteOne('users', { id: req.params.id })
            .then(result => {
                return res.status(200).send({ message: 'User deleted.' });
            });
    } catch (e) {
        return res.status(500).send({ message: 'Internal Server Error' });
    }
});

module.exports = router;