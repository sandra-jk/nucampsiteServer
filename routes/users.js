const express = require('express');
const User = require('../models/users');
const passport = require('passport');
const router = express.Router();
const authenticate = require('../authenticate');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/signup', async (req, res, next) => {
  try {
      const user = new User({username: req.body.username});
      if (req.body.firstname) {
          user.firstname = req.body.firstname;
      }
      if (req.body.lastname) {
          user.lastname = req.body.lastname;
      }

      // Register the user with a password
      const registeredUser = await User.register(user, req.body.password);
      
      // Save the user instance to the database
      await registeredUser.save();

      // Authenticate the user
      passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
      });

  } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
      next(err);
  }
});

router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    } else {
        const err = new Error('You are not logged in!');
        err.status = 401;
        return next(err);
    }
});

module.exports = router;
