const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const passport = require('passport')
const Strategy = require('passport-local').Strategy
const User = require('./internals/users')
const app = express()
const test = require('./internals/routes/test')
const apiHandler = require('./internals/routes/api/base')

passport.use(new Strategy(
    function(username, password, cb) {
        let user = User.checkValidity(username, password)
    }));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    User.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(bodyParser.json())

app.use(passport.initialize());
app.use(passport.session());

app.use('/test', test)

// app.use('/api', apiHandler)

app.get('/', (req, res) => {
    if (req.user) {
        console.log(req.user)
        res.sendFile(path.join(__dirname + '/index.html'))
    } else {
        res.sendFile(path.join(__dirname + '/login.html'))
    }
})

app.listen(8080, () => {
    console.log('Listening on 8080')
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/login.html'))
})

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/failed' }),
    function(req, res) {
    console.log('succ cess')
        res.redirect('/');
    });