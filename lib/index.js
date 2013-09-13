var v    = require('varnam'),
	path = require('path')

var datadir = process.env.OPENSHIFT_DATA_DIR || ""
console.log("Learning data will be stored in " + datadir)

var handles = {
	ml: new v.Varnam("vst/ml-unicode.vst", path.join(datadir, "learnings.varnam.ml")),
	hi: new v.Varnam("vst/hi-unicode.vst", path.join(datadir, "learnings.varnam.hi")),
	gu: new v.Varnam("vst/gu-unicode.vst", path.join(datadir, "learnings.varnam.gu"))
};

function supported_languages (req, res) {
    var response = [{code: 'hi', name: 'Hindi'}, {code: 'ml', name: 'Malayalam'}];
    res.json (response);
}

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

var db = require('./varnamdb').pool;
function learn (req, res) {
	var handle = handles[req.body.lang]
	if (handle == undefined) {
		res.status(400).send('Incorrect language code');
		return;
	}

	var textToLearn = req.body.text;

    // Learn happens in a scheduled job. We just queue the request
    db.getConnection (function (err, connection) {
        var q = 'insert ignore into words_to_learn (word, lang_code, ip) values (trim(?), trim(?), trim(?))';
        if (err) {
            res.status(500).send(err.message);
        }
        else {
            connection.query(q, [textToLearn, req.body.lang, req.connection.remoteAddress], function (err, result) {
                if (err) {
                    res.status(500).send(err.message);
                }
                else {
                    res.status(201).send("Success");
                }
            });
        }
    });
};

exports.supported_languages = supported_languages;
exports.tl = transliterate;
exports.rtl = reverse_transliterate;
exports.learn = learn;
