const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const uuid = require('uuid');
const repo = require('../repo/Repo.js');

const jwt = require('jsonwebtoken');

router.use(express.json());

function generateAccessToken(user) {
     return jwt.sign({ name: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '40m' });
}

router.post('/login', async (req, res) => {
     try {
          const userArray = await repo.find('users', { username: req.body.username });
          const user = userArray[0];

          if (user === undefined) {
               return res.status(400).send({ message: 'Could not find your user.' });
          }

          if (await bcrypt.compare(req.body.password, user.password)) {
               const accessToken = generateAccessToken(user);
               const refreshToken = jwt.sign({ name: user.username }, process.env.REFRESH_TOKEN_SECRET);

               const response = await repo.insert('refreshTokens', {
                    refreshToken
               });

               if (response === undefined) return res.status(500).send({ message: 'Error with database communication. Try again.' });

               return res.status(200).send({
                    message: 'Log in complete.',
                    accessToken,
                    refreshToken
               });
          } else {
               return res.status(401).send({ message: 'Wrong password.' });
          }
     } catch (e) {
          return res.status(500).send({ message: 'Internal Server Error.' });
     }
});

router.post('/token', async (req, res) => {
     const refreshToken = req.body.token;
     if (refreshToken === null) return res.status(401).send({ message: 'Refresh token does not exist. Please log in.' });

     try {
          const response = await repo.find('refreshTokens', { refreshToken: refreshToken });

          if (response === undefined) return res.status(500).send({ message: 'Error with database communication. Try again.' });

          jwt.sign(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
               if (error) {
                    const response = repo.deleteOne('refreshTokens', { refreshToken: refreshToken });

                    if (response === undefined) return res.status(500).send({ message: 'Error with database communication. Try again.' });

                    return res.status(403).send({ message: 'Refresh token expired. Please log in again.' });
               }
               const accessToken = generateAccessToken({ name: user.username });
               return res.status(200).send({ accessToken });
          });
     } catch (e) {
          return res.status(500).send({ message: 'Internal Server Error.' });
     }
});

router.post('/register', async (req, res) => {
     try {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);

          const response = await repo.insert('users', {
               id: uuid.v4().toString(),
               username: req.body.username,
               password: hashedPassword,
               roles: ["admin"]
          });

          return res.status(201).send({ message: 'User ' + req.body.username + ' created.' });
     } catch (e) {
          return res.status(500).send({ message: 'Internal Server Error.' });
     }
});

router.delete('/logout', (req, res) => {
     try {
          const token = req.body.token;

          const response = repo.deleteOne('refreshTokens', { refreshToken: token });

          if (response === undefined) return res.status(500).send({ message: 'Error with database communication. Try again.' });

          return res.status(200).send({ message: 'Logout complete.' });
     } catch (e) {
          return res.status(500).send({ message: 'Internal Server Error.' });
     }
});

module.exports = router;