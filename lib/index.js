var v = require('./varnam')

var varnam = new v.Varnam("vst/ml-unicode.vst");

function transliterate (req, res) {
	var result = varnam.transliterate(req.query.text)
	console.log(result);
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