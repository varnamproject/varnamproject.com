var v    = require('varnam')
var path = require('path')

var datadir = process.env.OPENSHIFT_DATA_DIR || ""
var learnings_file = path.join(datadir, "learnings.varnam");

console.log("Learning data will be stored in " + learnings_file)
var varnam = new v.Varnam("vst/ml-unicode.vst", learnings_file);

function transliterate (req, res) {
	var result = varnam.transliterate(req.query.text)
	res.json(result);
};

function reverse_transliterate (req, res) {
	var result = varnam.reverseTransliterate(req.query.text)
	res.json(result);
};

function learn (req, res) {
	var textToLearn = req.body.text;
	var result = varnam.learn(textToLearn);
	res.status(201).send(result);
};

exports.tl = transliterate;
exports.rtl = reverse_transliterate;
exports.learn = learn;
