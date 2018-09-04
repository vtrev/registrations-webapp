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
    database: 'greetings',
    password: '8423',
    port: 5432
});


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


app.get('/registrations/:plate', function (req, res) {
    let plate = req.body;
    res.send(plate);
})

app.post('/registrations', function (req, res) {
    console.log(req.body)
    // res.send
})

//FIRE TO THE SERVER  
app.listen(PORT, function () {
    console.log('Registrations app running on port : ', PORT)
});