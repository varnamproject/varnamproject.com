var v    = require('varnam')
var path = require('path')

var datadir = process.env.OPENSHIFT_DATA_DIR || ""
var learnings_file = path.join(datadir, "learnings.varnam");

console.log("Learning data will be stored in " + learnings_file)
var varnam = new v.Varnam("vst/ml-unicode.vst", learnings_file);

function transliterate (req, res) {
	varnam.transliterate(req.query.text, function(err, result) {
		res.json(result);
	});
};

function reverse_transliterate (req, res) {
	var result = varnam.reverseTransliterate(req.query.text)
	res.json(result);
};

function learn (req, res) {
	var textToLearn = req.body.text;
	varnam.learn(textToLearn, function(err) {
		if (null != err) {
			res.status(500).send(err.message);
		}
		else {
			res.status(201).send("Success");
		}
	});
};

exports.tl = transliterate;
exports.rtl = reverse_transliterate;
exports.learn = learn;
