/*
 * GET home page.
 */
exports.index = function (req, res) {
    res.render('index');
};

exports.keyboard = function (req, res) {
    res.render('keyboard');
};

exports.drums = function (req, res) {
    res.render('drums');
};