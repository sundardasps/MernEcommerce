const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const app = express();
const session = require('express-session');
const config = require('./configuration/config');
const nocache = require('nocache');
let dotenv = require("dotenv");
dotenv.config();
mongoose.connect(process.env.mongo);

app.use(session({
    secret:process.env.secret,
    resave: false,
    saveUninitialized: false,
}));

app.use(express.static(path.join(__dirname,'public')))
app.use(nocache());
app.use(express.json())

//====================FOR USEER ROUTE =================
const userRoutes = require("./routes/userRoutes");
app.use("/", userRoutes);

//===================FOR ADMIN ROUTE ===================
const adminRoute = require('./routes/adminRoutes');
const admin_route = require("./routes/adminRoutes");
app.use('/admin',adminRoute)


//====================FOR REDIRECT ADMIN =================
admin_route.get('*',function(req,res){
    res.redirect('/admin')
})


//================================== GOOGLE AUTHENTICATION ====================================
const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');


app.get('/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = process.env.googleClaintId;
const GOOGLE_CLIENT_SECRET = process.env.googleClaintSecret;
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.googleCallback
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));

const response = app.get('/auth/google', 

  passport.authenticate('google', { scope : ['profile', 'email'] }))


  
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),

  function(req, res) {

  // console.log();
    // Successful authentication, redirect success.
    res.redirect('/success');
  });



app.listen(process.env.port, () => console.log("server connected"));
