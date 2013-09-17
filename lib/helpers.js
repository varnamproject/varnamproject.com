// Helper functions used across the project

var v    = require('varnam'),
	path = require('path'),
    supportedLangs = ['ml', 'hi', 'gu'],
    datadir        = process.env.OPENSHIFT_DATA_DIR || "",
    fs      = require('fs');

function render404(res) {
    res.status(404).sendfile('404.html');
}

function getSymbolsFilePath(langCode) {
    return "vst/" + langCode + "-unicode.vst";
}

function getLearningsFilePath(langCode) {
    return path.join(datadir, "learnings.varnam." + langCode);
}

function getYesterdaysDate() {
    var d = new Date();
    d.setDate (d.getDate() - 1);
    return d;
}

function convertToYYYMMDD(d) {
    var month = (d.getMonth() + 1).toString(); // JS getMonth() is 0 based
    month = month.length == 1 ? '0' + month : month;
    var date = d.getDate().toString().length == 1 ? '0' + d.getDate().toString() : d.getDate().toString();
    return d.getFullYear().toString() +  '-' + month + '-' + date;
}

var handles = {};
for (var i = 0; i < supportedLangs.length; i++) {
    var lang = supportedLangs[i];
    handles[lang] = new v.Varnam(getSymbolsFilePath(lang), getLearningsFilePath(lang));
}

function getVarnamHandle(langCode) {
    return handles[langCode];
}

exports.render404 = render404;
exports.getVarnamHandle = getVarnamHandle;
exports.supportedLangs = supportedLangs;
exports.getSymbolsFilePath = getSymbolsFilePath;
exports.getLearningsFilePath = getLearningsFilePath;
exports.getYesterdaysDate = getYesterdaysDate;
exports.convertToYYYMMDD = convertToYYYMMDD;
