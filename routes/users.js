const express = require('express');
const User = require('../models/users');
const passport = require('passport');
const authenticate = require('../authenticate');

const router = express.Router();


router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find()
  .then(users => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
  })
  .catch(err => next(err));
  res.send('respond with a resource');
});

router.post('/signup', async (req, res) => {
  try {
      const user = new User({ username: req.body.username });

      // Register the user 
      await User.register(user, req.body.password);

      // Update the user object 
      if (req.body.firstname) {
          user.firstname = req.body.firstname;
      }
      if (req.body.lastname) {
          user.lastname = req.body.lastname;
      }

    
      await user.save();

      passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, status: 'Registration Successful!' });
      });
  } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({ err: err });
  }
});


router.post('/login', passport.authenticate('local', { session: false }),(req, res) => {
  const token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/logout', (req, res, next) => {
  if(req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    const err = new Error('You are not logged in');
    err.status = 403;
    next(err);
  }
});

module.exports = router;