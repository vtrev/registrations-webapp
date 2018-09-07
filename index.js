'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const PORT = process.env.PORT || 3030;
const session = require('express-session');
const flash = require('express-flash');
const regFacctory = require('./Reg-Factory');
const Routes = require('./Routes');
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
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:pass@localhost:5432/registrations';

const pool = new Pool({
    connectionString,
    ssl: useSSL
});

const regInstance = regFacctory(pool);
const routesInstance = Routes(regInstance);

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

// Routes
app.get('/', routesInstance.root);

app.get('/displayPlates', routesInstance.displayPlates);

app.post('/registrations', routesInstance.registrations);

//FIRE TO THE SERVER  
app.listen(PORT, function () {
    console.log('Registrations app running on port : ', PORT)
});