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

    let createRegData = async function (plate) {
        let regData = {};
        let regTown = getTown(plate);
        let townIdQuery = await pool.query('SELECT id FROM towns WHERE starts_with=$1', [regTown]);
        regData.town = townIdQuery.rows[0].id;
        regData.plate = plate.toUpperCase();
        return regData
    }
    let addReg = async function (regData) {
        let regNoToENter = regData.plate;
        let town_id = regData.town;
        let sql = 'INSERT INTO registrations(town_id,registration) values($1,$2)';
        let params = [town_id, regNoToENter];
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
            const sql0 = 'SELECT id FROM towns WHERE starts_with=$1';
            const params0 = [town];
            let result0 = await pool.query(sql0, params0);
            let regId = result0.rows[0].id;
            const params1 = [regId]
            const sql1 = 'SELECT registration FROM registrations WHERE town_id=$1';
            let result1 = await pool.query(sql1, params1);
            return result1.rows;
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

    //method to check for duplicates.....NB! Only call this method if the registration passes the validator.
    let checkMatch = async function (plate) {
        plate = plate.toUpperCase();
        const sql = 'SELECT * FROM registrations WHERE registration =$1';
        const params = [plate];
        let result = await pool.query(sql, params);
        if (result.rowCount > 0) {
            return 'matched'
        } else if (result.rowCount === 0) {
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