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
// const pool = new Pool({
//     user: 'lryyjklbkpoyvv',
//     host: 'ec2-54-225-92-1.compute-1.amazonaws.com',
//     database: 'dvpi1u6n33sj8',
//     password: '2e8ef2ec5aad80551c6997707d10ab7ca405410e7c8a9233d283614b0c059d18',
//     port: 5432,
//     ssl: true
// });
// local pool

const pool = new Pool({
    user: 'coder',
    host: '127.0.0.1',
    database: 'registrations',
    password: '8423',
    port: 5432
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
app.get('/', function (req, res) {
    res.render('home');
})
// app.get('/registrations/:plate', function (req, res) {
// let regEntered = req.params.plate;
// res.send(regEntered);
// })
app.get('/displayPlates',
    async function (req, res) {
        let town = req.query.town;
        console.log(town);
        let result = await regInstance.getPlate(town);
        console.log(result.length);
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
            req.flash('info', query + ' : ' + regEntered);
            res.render('home', {
                status: 'success'
            })
        } else if (await regInstance.checkMatch(regEntered) === 'matched') {
            req.flash('info', 'Oops! Regisatration number: ' + regEntered + ' has already been stored in the database.');
            res.render('home', {
                status: 'warning'
            });
        };
    };
    if (await regInstance.validateReg(regEntered) === 'invalid') {
        req.flash('info', 'Oops! Regisatration number: ' + regEntered + ' does not seem to be valid,please enter registrations from the available towns on the menu');
        res.render('home', {
            status: 'warning'
        })
    }

})

//FIRE TO THE SERVER  
app.listen(PORT, function () {
    console.log('Registrations app running on port : ', PORT)
});