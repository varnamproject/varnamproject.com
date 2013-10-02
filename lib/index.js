var v    = require('varnam'),
	path = require('path'),
    helper = require('./helpers.js');

var datadir = process.env.VARNAM_DATA_DIR || ""
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

                connection.release();
            });
        }
    });
};

function wordsToDownload (req, res) {
    var langCode = req.param('langCode'),
        year = req.param('year'),
        month = req.param('month'),
        date = req.param('date'),
        handle = helper.getVarnamHandle (langCode);

    if (handle === undefined || isNaN (year) || isNaN (month) || isNaN (date)) {
        helper.render404 (res);
        return;
    }

    if (year.length != 4 || month.length > 2 || date.length > 2) {
        helper.render404 (res);
        return;
    }

    if (month.length == 1)
        month = '0' + month;

    if (date.length == 1)
        date = '0' + date;

    var dateStamp = year + '-' + month + '-' + date;
    db.getConnection (function (err, connection) {
        var q = 'select word, confidence from words_to_download where ' 
                + ' date(d) > date(trim(?)) and lang_code = trim(?) order by word';
        if (err) {
            res.status(500).send(err.message);
        }
        else {
            connection.query(q, [dateStamp, langCode], function (err, rows, fields) {
                if (err) {
                    res.status(500).send(err.message);
                }
                else {
                    res.set('Content-Type', 'text/plain');
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        res.write(row.word + ' ' + row.confidence + '\n');
                    }
                    res.end();
                }
                connection.release();
            });
        }
    });

}

exports.supported_languages = supported_languages;
exports.tl = transliterate;
exports.rtl = reverse_transliterate;
exports.learn = learn;
exports.wordsToDownload = wordsToDownload;
exports.learn = learn;
