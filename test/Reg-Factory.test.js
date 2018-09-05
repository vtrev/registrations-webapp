'use strict'

const assert = require('assert');
const registrations = require('../Reg-Factory');
const pg = require("pg");
const Pool = pg.Pool;

// local pool
const pool = new Pool({
    user: 'coder',
    host: '127.0.0.1',
    database: 'registrations',
    password: '8423',
    port: 5432
});

// // // Heroku pool
// const pool = new Pool({
//     user: 'lryyjklbkpoyvv',
//     host: 'ec2-54-225-92-1.compute-1.amazonaws.com',
//     database: 'dvpi1u6n33sj8',
//     password: '2e8ef2ec5aad80551c6997707d10ab7ca405410e7c8a9233d283614b0c059d18',
//     port: 5432,
//     ssl: true
// });

const RegInstance = registrations(pool);

describe('Greetings web app', function () {
    beforeEach(async function () {
        await pool.query('DELETE from registrations');
    });

    // Testing method that handles 2 or 3 characters a registration can start with
    it('Should return the first characters of a registration that detemine which town the car is from', async function () {
        let result0 = await RegInstance.getTown('CAW 12345');
        let result1 = await RegInstance.getTown('CA 12345');
        assert.equal(result0, 'CAW');
        assert.equal(result1, 'CA');
    });

    // method that creates the registration data to be used to insert the registration into the database
    it('Given a registration number string, it should return an object with the town identifying characters and the plate', async function () {
        let result = await RegInstance.createReg('CY 454 696');

        assert.deepEqual(result, {
            plate: 'CY 454 696',
            town: 'CY'
        })
    });


});