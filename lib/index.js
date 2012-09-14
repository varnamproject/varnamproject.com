var v    = require('varnam'),
	path = require('path')

var datadir = process.env.OPENSHIFT_DATA_DIR || ""
console.log("Learning data will be stored in " + datadir)

var handles = {
	ml: new v.Varnam("vst/ml-unicode.vst", path.join(datadir, "learnings.varnam.ml")),
	gu: new v.Varnam("vst/gu-unicode.vst", path.join(datadir, "learnings.varnam.gu"))
};

function transliterate (req, res) {
	var handle = handles[req.query.lang]
	if (handle == undefined) {
		res.status(400).send('Incorrect language code');
		return;
	}

	handle.transliterate(req.query.text, function(err, result) {
		if (err != null) {
			res.status(500).send(err.message);
		}
		else {
			var response = {input: req.query.text, result: result}
			res.json(response);
		}
	});
};

function reverse_transliterate (req, res) {
	var handle = handles[req.query.lang]
	if (handle == undefined) {
		res.status(400).send('Incorrect language code');
		return;
	}

	var result = handle.reverseTransliterate(req.query.text)
	res.json(result);
};

function learn (req, res) {
	var handle = handles[req.body.lang]
	if (handle == undefined) {
		res.status(400).send('Incorrect language code');
		return;
	}

	var textToLearn = req.body.text;
	handle.learn(textToLearn, function(err) {
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
