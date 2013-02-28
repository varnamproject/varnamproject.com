var v    = require('varnam'),
	path = require('path'),
    util = require('util');

var datadir = process.env.OPENSHIFT_DATA_DIR || "";
console.log("Learning data will be stored in " + datadir);

var learnings = [
        {langCode: 'ml', name: 'Malayalam', path: path.join(datadir, "learnings.varnam.ml")}, 
        {langcode: 'gu', name: 'Gujarati',  path: path.join(datadir, "learnings.varnam.gu")}];

var handles = {
	ml: new v.Varnam("vst/ml-unicode.vst", learnings[0].path),
	gu: new v.Varnam("vst/gu-unicode.vst", learnings[1].path)
};

function getLearningsFileFor(langCode) {
    for (var i = 0; i < learnings.length; i++) {
        if (learnings[i].langCode == langCode) {
            return learnings[i].path;
        }
    }
    return undefined;
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

function addCommas(str) {
    var amount = new String(str);
    amount = amount.split("").reverse();

    var output = "";
    for ( var i = 0; i <= amount.length-1; i++ ){
            output = amount[i] + output;
            if ((i+1) % 3 == 0 && (amount.length-1) !== i)output = ',' + output;
        }
    return output;
}

function admin (req, res) {
    var sqlite3 = require('sqlite3').verbose();
    res.locals.summary = [];
    var executed = 0;
    for(var i = 0; i < learnings.length; i++) {
        var learning = learnings[i];

        (function(learning){
            var db = new sqlite3.Database(learning.path);
            db.parallelize(function(){
                var thisSummary = {name: learning.name};

                db.each("SELECT count(id) as total from words", function(err, row) {
                    thisSummary.totalWords = addCommas(row.total);
                });

                db.each("SELECT count(pattern) as total from patterns_content", function(err, row) {
                    thisSummary.totalPatterns = addCommas(row.total);
                    res.locals.summary.push(thisSummary);
                    if (++executed == learnings.length) {
                        res.render('admin/index');
                    }
                });
            });
            db.close();

        })(learning);
    }
}

function formatDateToSQLiteDate(date) {
    var month = util.format('%d', date.getMonth() + 1);
    if (month.length < 2) {
        // SQLite needs two digit month and date 
        month = util.format('0%s', month);
    }

    var thisDate = util.format('%d', date.getDate());
    if (thisDate.length < 2) {
        thisDate = util.format('0%s', thisDate);
    }

    return util.format('%s-%s-%s', date.getFullYear(), month, thisDate);
}

function getLearnedWordsForLastDays(req, res) {
    var sqlite3 = require('sqlite3').verbose();
    var lang = req.query.lang;
    var noOfDays = req.query.days;
    if (noOfDays === undefined || noOfDays <= 0) {
        noOfDays = 3;
    }

    if (!lang || lang == '') {
        res.status(400).send('Language not specified');
        return;
    }

    var path = getLearningsFileFor(lang);
    if (!path) {
        res.status(400).send('Incorrect language');
        return;
    }

    var now = new Date();
    var fewDaysBack = new Date();
    fewDaysBack.setDate(now.getDate() - noOfDays);

    var result = [];
    var eachRow = function(err, row) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }

        result.push({id: row.id, word: row.word, confidence: row.confidence, learnedOn: row.learned_on});
    };

    var queryCompleted = function(err, row) {
        if (err) {
            res.status(500).send(err.message);
        }
        else {
            res.json(result);
        }
    };

    var sql = "select id, word, confidence, learned_on from words where learned_on <= date(?) and learned_on > date(?) order by learned_on desc;";
    var db = new sqlite3.Database(path);
    db.each(sql, formatDateToSQLiteDate(now), formatDateToSQLiteDate(fewDaysBack), eachRow, queryCompleted);
    db.close();
}

function deleteWord(req, res) {
    var sqlite3 = require('sqlite3').verbose();
    var id = req.body.id;
    var lang = req.body.lang;
    if (!id || id == '') {
        res.status(400).send('Incorrect word id');
        return;
    }
    if (!lang || lang == '') {
        res.status(400).send('Incorrect language code');
        return;
    }
    var path = getLearningsFileFor(lang);
    if (!path) {
        res.status(400).send('Incorrect language');
        return;
    }

    var db = new sqlite3.Database(path);
    db.run('delete from patterns_content where word_id = ?', id, function(err) {
        if (err) {
            res.status(500).send(err.message);
        }
        else {
            db.run('delete from words where id = ?', id, function(err) {
                if (err) {
                    res.status(500).send(err.message);
                }
                else {
                    res.json('Success');
                }
            });
        }
    });
    db.close();
}

function searchWord(req, res) {
    var sqlite3 = require('sqlite3').verbose();
    var lang = req.query.lang;
    var word = req.query.word;

    if (!lang || lang == '') {
        res.status(400).send('Language not specified');
        return;
    }

    var path = getLearningsFileFor(lang);
    if (!path) {
        res.status(400).send('Incorrect language');
        return;
    }

    if (!word || word == '') {
        res.status(400).send('Incorrect word');
        return;
    }

    var result = [];
    var eachRow = function(err, row) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }

        result.push({id: row.id, word: row.word, confidence: row.confidence, learnedOn: row.learned_on});
    };

    var queryCompleted = function(err, row) {
        if (err) {
            res.status(500).send(err.message);
        }
        else {
            res.json(result);
        }
    };

    var db = new sqlite3.Database(path);
    db.each("select id, word, confidence, learned_on from words where word = ?", word, eachRow, queryCompleted);
    db.close();
}

exports.tl = transliterate;
exports.rtl = reverse_transliterate;
exports.learn = learn;
exports.admin = admin;
exports.getLearnedWordsForLastDays = getLearnedWordsForLastDays;
exports.deleteWord = deleteWord;
exports.searchWord = searchWord;
