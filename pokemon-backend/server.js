require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const User = require('./models/User'); // User model
const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // Allow the frontend origin
    credentials: true // Allow credentials (cookies, sessions) to be sent
  }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Configure express-session
app.use(session({
    secret: process.env.COOKIE_SECRET, // replace with your own secret from the .env file
    resave: false,
    saveUninitialized: false,
    cookie: { secure: 'auto' } // 'auto' will use 'true' if the site uses HTTPS
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Configure passport with Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/google/callback'
  },
  (accessToken, refreshToken, profile, cb) => {
    // Ensure that profile has an 'id' field
    const user = {
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value
    };
    console.log(user);
    User.findOrCreate({ googleId: user.googleId }, user)
      .then(user => cb(null, user))
      .catch(err => cb(err));
  }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    }).catch(err => done(err));
});

// Google Auth Routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('http://localhost:3000'); // Your React app's URL
    }
);

// Check if user is authenticated
app.get('/api/checkAuthentication', (req, res) => {
    if (req.user) {
        res.status(200).json(req.user);
    } else {
        res.status(401).json({ message: 'User not authenticated' });
    }
});

app.get('/auth/logout', (req, res) => {
    req.logout(function(err) {
      if (err) { 
        console.error('Logout error:', err);
        return res.status(500).send('Logout failed');
      }
      req.session.destroy(function(err) {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).send('Logout failed');
        }
        res.clearCookie('connect.sid'); // Ensure you're clearing the right cookie name
        return res.redirect('http://localhost:5000/auth/google'); // Redirect to the React app's URL
      });
    });
  });
  
  
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
