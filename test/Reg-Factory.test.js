'use strict'

const assert = require('assert');
const Registrations = require('../Reg-Factory');
const pg = require("pg");
const Pool = pg.Pool;


const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:pass@localhost:5432/registrations';

const pool = new Pool({
    connectionString
});

const regInstance = Registrations(pool);

describe('Registrations web app', function () {
    beforeEach(async function () {
        await pool.query('DELETE from registrations');
    });

    // Testing method that handles 2 or 3 characters a registration can start with
    it('Should return the first characters of a registration that detemine which town the car is from', async function () {
        let result0 = await regInstance.getTown('CAW 12345');
        let result1 = await regInstance.getTown('CA 12345');
        assert.equal(result0, 'CAW');
        assert.equal(result1, 'CA');
    });

    // method that creates the registration data to be used to insert the registration into the database
    it('Given a registration number string, it should return an object with the town identifying characters and the plate', async function () {
        let result = await regInstance.createReg('CY 454 696');
        assert.deepEqual(result, {
            plate: 'CY 454 696',
            town: 2
        })
    });
    // method that adds registrations into the database
    it('Given an object with registrationData,it should insert the registration into the database', async function () {
        let regData = {
            plate: 'CA 56565',
            town: 1
        };
        let result = await regInstance.addPlate(regData);
        assert.equal(result, 'Registration was added successfully');
    });
    // method that gets the registrations from the database
    it('Shuold return back a list of registrations from the specified town', async function () {
        let regData0 = {
            plate: 'CA 56565',
            town: 1
        };

        let regData1 = {
            plate: 'CY 1235',
            town: 2
        };
        let regData2 = {
            plate: 'CAW 9995',
            town: 5
        };
        let regData3 = {
            plate: 'CAW 66565',
            town: 5
        };

        await regInstance.addPlate(regData0);
        await regInstance.addPlate(regData1);
        await regInstance.addPlate(regData2);
        await regInstance.addPlate(regData3);

        let result = await regInstance.getPlate('allTowns');
        assert.deepEqual(result, [{
            registration: regData0.plate
        }, {
            registration: regData1.plate
        }, {
            registration: regData2.plate
        }, {
            registration: regData3.plate
        }]);
        let cawResult = await regInstance.getPlate('CAW');
        assert.deepEqual(cawResult, [{
            registration: regData2.plate
        }, {
            registration: regData3.plate
        }]);


    })
    // testing the method that validates number plates
    it('Should return valid if the registration number that is being entered is from one of the available towns and return invalid if ot is not the case', async function () {
        let result0 = await regInstance.validateReg('CAW 12345');
        let result1 = await regInstance.validateReg('DFD 65421');
        let result2 = await regInstance.validateReg('CA 12345');
        let result3 = await regInstance.validateReg('GP skoro');
        assert.equal(result0, 'valid');
        assert.equal(result1, 'invalid');
        assert.equal(result2, 'valid');
        assert.equal(result3, 'invalid');
    });
    // testing for method that checks for duplicate registration number entries
    it('Should return matched if a given registrations is found in the database and mismatched if it is not found', async function () {

        let regData0 = {
            plate: 'CA 56565',
            town: 1
        };
        await regInstance.addPlate(regData0);

        let result0 = await regInstance.checkMatch('CA 56565');
        let result1 = await regInstance.checkMatch('CAW 45455');
        assert.equal(result1, 'mismatched');
        assert.equal(result0, 'matched');
    });
});