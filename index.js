'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const PORT = process.env.PORT || 3030;
const session = require('express-session');
const flash = require('express-flash');
const regFacctory = require('./Reg-Factory');

// DB Setup

const {
    Pool
} = require('pg');
// Heroku pool
let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
    useSSL = true;
}
// which db connection to use
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/registrations';

const pool = new Pool({
    connectionString,
    ssl: useSSL
});


const regInstance = regFacctory(pool);

// Routes
app.use(session({
    secret: 'Tshimugaramafatha'
}));

app.use(flash());

app.engine('handlebars', exphbs({
    defaultLayout: 'main',
}));
app.set('view engine', 'handlebars');
app.use('/', express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Router
app.get('/', async function (req, res) {
    let result = await regInstance.getPlate('allTowns');
    res.render('home', {
        regs: result
    });
});

app.get('/displayPlates',
    async function (req, res) {
        let town = req.query.town;
        let result = await regInstance.getPlate(town);
        if (result.length == 0) {
            req.flash('info', 'Sorry, no registrations have been stored from this town yet.');
            res.render('home', {
                status: 'warning'
            });
        } else {
            res.render('home', {
                regs: result
            })
        };
    });

app.post('/registrations', async function (req, res) {
    let regEntered = req.body.regEntered;
    if (await regInstance.validateReg(regEntered) === 'valid') {
        if (await regInstance.checkMatch(regEntered) === 'mismatched') {
            let tmpReg = await regInstance.createReg(regEntered);
            let query = await regInstance.addPlate(tmpReg);
            let result = await regInstance.getPlate('allTowns');
            req.flash('info', query + ' : ' + regEntered);
            res.render('home', {
                status: 'success',
                regs: result
            })
        } else if (await regInstance.checkMatch(regEntered) === 'matched') {
            req.flash('info', 'Oops! Regisatration number: ' + regEntered + ' has already been stored in the database.');
            res.render('home', {
                status: 'warning'
            });
        };
    } else if (await regInstance.validateReg(regEntered) === 'invalid') {
        req.flash('info', 'Oops! Regisatration number: ' + regEntered + ' does not seem to be valid,please enter registrations from the available towns on the menu');
        res.render('home', {
            status: 'warning'
        });
    };

});

//FIRE TO THE SERVER  
app.listen(PORT, function () {
    console.log('Registrations app running on port : ', PORT)
});