module.exports = function (regInstance) {

    let displayPlates = async function (req, res) {
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
    };

    let root = async function (req, res) {
        let result = await regInstance.getPlate('allTowns');
        res.render('home', {
            regs: result
        });
    };

    let registrations = async function (req, res) {
        let regEntered = req.body.regEntered;
        if (await regInstance.validateReg(regEntered) === 'valid') {
            if (await regInstance.checkMatch(regEntered) === 'mismatched') {
                let tmpReg = await regInstance.createReg(regEntered);
                let query = await regInstance.addPlate(tmpReg);
                let result = await regInstance.getPlate('allTowns');
                regEntered = regEntered.toUpperCase();
                req.flash('info', query + ' : ' + regEntered);
                res.render('home', {
                    status: 'success',
                    regs: result
                })
            } else if (await regInstance.checkMatch(regEntered) === 'matched') {
                regEntered = regEntered.toUpperCase();
                req.flash('info', 'Oops! Regisatration number: ' + regEntered + ' has already been stored in the database.');
                res.render('home', {
                    status: 'warning'
                });
            };
        } else if (await regInstance.validateReg(regEntered) === 'invalid') {
            regEntered = regEntered.toUpperCase();
            req.flash('info', 'Oops! Regisatration number: ' + regEntered + ' does not seem to be valid,please enter registrations from the available towns on the menu.');
            res.render('home', {
                status: 'warning'
            });
        };

    };
    // Factory returns
    return {
        displayPlates,
        root,
        registrations
    };
};