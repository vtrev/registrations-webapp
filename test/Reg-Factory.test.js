'use strict'

const assert = require('assert');
const registrations = require('../Reg-Factory');
const pg = require("pg");
const Pool = pg.Pool;

// local pool
// const pool = new Pool({
//     user: 'coder',
//     host: '127.0.0.1',
//     database: 'registrations',
//     password: '8423',
//     port: 5432
// });


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








// Heroku pool
// const pool = new Pool({
//     user: 'wpaqijivkbjxru',
//     host: 'ec2-184-72-247-70.compute-1.amazonaws.com',
//     database: 'd1mbfvltamn5tq',
//     password: '3a5459505d47795bfea9baf1581bc3d14d379e05fc074db84401913ca260fdd1',
//     port: 5432,
//     ssl: true
// });

const RegInstance = registrations(pool);

describe('Registrations web app', function () {
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
    // method that adds registrations into the database
    it('Given an object with registrationData,it should insert the registration into the database', async function () {
        let regData = {
            plate: 'CA 56565',
            town: 'CA'
        };
        let result = await RegInstance.addPlate(regData);
        assert.equal(result, 'Registration was added successfully');
    });
    // method that gets the registrations from the database
    it('Shuold return back a list of registrations from the specified town', async function () {
        let regData0 = {
            plate: 'CA 56565',
            town: 'CA'
        };

        let regData1 = {
            plate: 'CY 1235',
            town: 'CY'
        };
        let regData2 = {
            plate: 'CAW 9995',
            town: 'CAW'
        };
        let regData3 = {
            plate: 'CAW 66565',
            town: 'CAW'
        };

        await RegInstance.addPlate(regData0);
        await RegInstance.addPlate(regData1);
        await RegInstance.addPlate(regData2);
        await RegInstance.addPlate(regData3);

        let result = await RegInstance.getPlate('allTowns');
        assert.deepEqual(result, [{
            registration: regData0.plate
        }, {
            registration: regData1.plate
        }, {
            registration: regData2.plate
        }, {
            registration: regData3.plate
        }]);
        let cawResult = await RegInstance.getPlate('CAW');
        assert.deepEqual(cawResult, [{
            registration: regData2.plate
        }, {
            registration: regData3.plate
        }]);


    })
    // testing the method that validates number plates
    it('Should return valid if the registration number that is being entered is from one of the available towns and return invalid if ot is not the case', async function () {
        let result0 = await RegInstance.validateReg('CAW 12345');
        let result1 = await RegInstance.validateReg('DFD 65421');
        let result2 = await RegInstance.validateReg('CA 12345');
        let result3 = await RegInstance.validateReg('GP skoro');
        assert.equal(result0, 'valid');
        assert.equal(result1, 'invalid');
        assert.equal(result2, 'valid');
        assert.equal(result3, 'invalid');
    });
    // testing for method that checks for duplicate registration number entries
    it('Should return matched if a given registrations is found in the database and mismatched if it is not found', async function () {

        let regData0 = {
            plate: 'CA 56565',
            town: 'CA'
        };
        await RegInstance.addPlate(regData0);

        let result0 = await RegInstance.checkMatch('CA 56565');
        let result1 = await RegInstance.checkMatch('CAW 45455');
        assert.equal(result1, 'mismatched');
        assert.equal(result0, 'matched');
    });
});