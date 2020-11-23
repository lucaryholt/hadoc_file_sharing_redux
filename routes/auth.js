const router = require('express').Router();
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailer = require('../util/mailer.js');
const repo = require('../util/repo.js');
const jwt = require('jsonwebtoken');
const authenticator = require('../util/jwtAuthenticate.js');

function generateAccessToken(user) {
     return jwt.sign({ name: user.username, roles: user.roles }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '40m' });
}

router.get('/auth/confirm-email/:id', (req, res) => {
     try {
          repo.find('usersNotConfirmed', { id: req.params.id })
              .then(result => {
                   if (result.length === 0) return res.status(404).send({ message: 'Could not confirm email.' });
                   else {
                        repo.insert('users', result[0])
                            .then(result => {
                                 repo.deleteOne('usersNotConfirmed', { id: req.params.id });
                                 return res.status(200).send({ message: 'Email confirmed. User can now log in.' });
                            });
                   }
              })
     } catch (e) {
          return res.status(500).send({ message: 'Internal Server Error.' });
     }
});

router.get('/auth/requestpasswordreset/:username', async (req, res) => {
     try {
          const id = uuid.v4();
          const user = await repo.find('users', { username: req.params.username })

          if (user.length === 0) return res.status(404).send({ message: 'No user with that email.' });
          else {
               repo.insert('passwordresets', {
                    id,
                    requestTime: new Date().getTime(),
                    username: req.params.username
               })
                   .then(result => {
                        mailer.sendResetPasswordEmail(req.params.username, id);

                        return res.status(200).send({ message: 'Email sent! Please click link in email.' });
                   });
          }
     } catch (e) {
          return res.status(500).send({ message: 'Internal Server Error' });
     }
});

router.post('/auth/resetpassword', async (req, res) => {
     try {
          const resetPasswordRequest = await repo.find('passwordresets', { id: req.body.id });

          if (resetPasswordRequest.length === 0) return res.status(404).send({ message: 'Could not find that request.' });

          const hashedPassword = await bcrypt.hash(req.body.password, 10);

          repo.update('users', { username: resetPasswordRequest[0].username }, { password: hashedPassword })
              .then(result => {
                    repo.deleteOne('passwordresets', { id: resetPasswordRequest[0].id })
                        .then(result => {
                              return res.status(200).send({ message: 'Password reset. You can now log in again.' });
                        });
              });
     } catch (e) {
          return res.status(500).send({ message: 'Internal Server Error' });
     }
});

router.post('/auth/login', async (req, res) => {
     try {
          const userArray = await repo.find('users', { username: req.body.username });
          const user = userArray[0];

          if (user === undefined) {
               return res.status(400).send({ message: 'Could not find your user.' });
          }

          if (await bcrypt.compare(req.body.password, user.password)) {
               const accessToken = generateAccessToken(user);
               const refreshToken = jwt.sign({ name: user.username, roles: user.roles }, process.env.REFRESH_TOKEN_SECRET);

               const response = await repo.insert('refreshTokens', {
                    refreshToken,
                    authTime: new Date().getTime()
               });

               if (response === undefined) return res.status(500).send({ message: 'Error with database communication. Try again.' });

               return res.status(200).send({
                    message: 'Log in complete.',
                    username: user.username,
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

router.post('/auth/token', async (req, res) => {
     const refreshToken = req.body.token;
     if (refreshToken === null) return res.status(401).send({ message: 'Please log in.' });

     try {
          const response = await repo.find('refreshTokens', { refreshToken: refreshToken });

          if (response === undefined) return res.status(403).send({ message: 'Could not authorize token. Please log in and try again.' });

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

router.post('/auth/register', async (req, res) => {
     try {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          const id = uuid.v4().toString();

          const user = await repo.find('users', { username: req.body.username });
          if (user.length !== 0) return res.status(403).send({ message: 'User with that email is already registered.' });

          const unconfirmedUser = await repo.find('usersNotConfirmed', { username: req.body.username });
          if (unconfirmedUser.length !== 0) return res.status(403).send({ message: 'User with that email is already registered.' });

          const response = await repo.insert('usersNotConfirmed', {
               id,
               createdTime: new Date().getTime(),
               username: req.body.username,
               password: hashedPassword,
               roles: ["user"]
          });

          mailer.sendConfirmEmail(req.body.username, id);

          return res.status(201).send({ message: 'User ' + req.body.username + ' created. Please confirm email address before logging in.' });
     } catch (e) {
          return res.status(500).send({ message: 'Internal Server Error.' });
     }
});

// The logout request is a DELETE method, as this deletes the refreshToken from the database
router.delete('/logout', authenticator, (req, res) => {
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