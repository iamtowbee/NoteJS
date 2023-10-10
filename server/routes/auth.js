const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
  async function (accessToken, refreshToken, profile, callback)
  {
    const newUser = {
      googleId: profile.id,
      displayName: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      profileImage: profile.photos[0].value
    }

    try {
      let user = await User.findOne({googleId: profile.id});

      if (user) {
        callback(null, user);
      } else {
        user = await User.create(newUser);
        callback(null, user);
      }

    } catch (err) {
      console.log(err);
    }
  }
));

// Google Login Route
router.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }));

// Retrieve user data
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login-failure',
    successRedirect: '/dashboard' 
  })
);

// Route if something goes wrong
router.get('/login-failure', (req, res) => {
  res.send('Authentication went wrong...');
});

// Destroy session
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
      res.send('Error logging out!');
    } else {
      res.redirect('/');
    }
  });
});

// Persist user data after sucessful auth
passport.serializeUser((user, callback) => {
  callback(null, user.id);
});

// Retrieve user data from session
passport.deserializeUser((id, callback) => {
  User.findById(id)
  .then((user) => callback(null, user))
  .catch((err) => console.log(err));
});

module.exports = router;