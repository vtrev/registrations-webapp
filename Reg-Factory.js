module.exports = function RegFactory(pool) {

    let getTown = function (plate) {
        if (plate.charAt(2) === ' ') {
            let startsWith = plate.substr(0, 2);
            return startsWith
        };
        if (plate.charAt(3) === ' ') {
            let startsWith = plate.substr(0, 3);
            return startsWith;
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
        let sql = 'INSERT INTO registrations(registration,starts_with) values($1,$2)';
        let params = [regNoToENter, town];
        // add some try and throw situation on this block
        let result = await pool.query(sql, params);
        return 'Registration was added successfully';
    }

    // returns

    return {
        addPlate: addReg,
        getTown,
        createReg: createRegData
    }
}