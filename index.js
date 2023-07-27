const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const app = express();
const session = require('express-session');
const config = require('./configuration/config');
const nocache = require('nocache');
let dotenv = require("dotenv");
const easyInvoice = require('easyinvoice')
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
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.googleClaintId,
  clientSecret: process.env.googleClaintSecret,
  callbackURL: "http://localhost:3000/auth/google/callback"
},
function(accessToken, refreshToken, profile, done) {
    userProfile=profile;
    return done(null, userProfile);
}
));

passport.serializeUser(function(user,done){
  done(null,user);
})

passport.deserializeUser(function(user,done){
  done(null,user)
})

app.use(passport.initialize());
app.use(passport.session());



app.get('/auth/google', 
  passport.authenticate('google', { scope : ['https://www.googleapis.com/auth/plus.login'] }));

  app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/');
  });


app.listen(process.env.port, () => console.log("server connected"));
