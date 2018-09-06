module.exports = function RegFactory(pool) {

    let getTown = function (plate) {
        if (plate.charAt(2) === ' ') {
            let startsWith = plate.substr(0, 2);
            return startsWith.toUpperCase();
        };
        if (plate.charAt(3) === ' ') {
            let startsWith = plate.substr(0, 3);
            return startsWith.toUpperCase();
        };
    };

    let createRegData = function (plate) {
        let regData = {};
        regData.town = getTown(plate);
        regData.plate = plate;
        return regData
    }
    let addReg = async function (regData) {
        let regNoToENter = regData.plate;
        let town = regData.town;
        let sql = 'INSERT INTO registrations(starts_with,registration) values($1,$2)';
        let params = [town, regNoToENter];
        // add some try and throw situation on this block
        let result = await pool.query(sql, params);
        if (result.rowCount == 1) {
            return 'Registration was added successfully'
        } else {
            return 'There was an error while adding the registration'
        }
    }
    // method to get registrations from the database
    let getReg = async function (town) {
        if (town == 'allTowns') {
            const sql = 'SELECT registration FROM registrations';
            let result = await pool.query(sql);
            return result.rows;
        } else {
            const sql = 'SELECT registration FROM registrations WHERE starts_with=$1';
            const params = [town];
            let result = await pool.query(sql, params);
            return result.rows
        }

    }
    // method to check registration validity
    let validateReg = async function (plate) {
        const sql = 'SELECT * FROM towns WHERE starts_with=$1';
        let starts_with = getTown(plate);
        const params = [starts_with];
        let result = await pool.query(sql, params);
        if (result.rowCount == 1) {
            return 'valid'
        } else if (result.rowCount == 0) {
            return 'invalid'
        };
    };

    //method to check for duplicates.....NB! Only call this method id the registration passes the validator.
    let checkMatch = async function (plate) {
        const sql = 'SELECT FROM registrations WHERE registration =$1';
        const params = [plate];
        let result = await pool.query(sql, params);
        if (result.rowCount > 0) {
            return 'matched'
        } else {
            return 'mismatched'
        }

    }
    // Factory returns

    return {
        addPlate: addReg,
        getTown,
        createReg: createRegData,
        getPlate: getReg,
        validateReg,
        checkMatch
    };
};