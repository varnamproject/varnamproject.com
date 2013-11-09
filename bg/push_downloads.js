// This Job pushes newly learned words for clients to download

var db   = require('../lib/varnamdb').pool,
    sqlite3 = require('sqlite3').verbose(),
    helper = require('../lib/helpers.js'),
    lastCheckedOn = '';

function pushWordsLearnedOn(learnedDate, langCode, callback) {
    db.getConnection (function (err, connection) {
        if (err) {
            console.log ('Failed to get connection while checking for push words: ' + err.message);
            return;
        }

        var q = 'select count(*) as status from words_to_download where d = ? and lang_code = ?';
        connection.query (q, [learnedDate, langCode], function (err, rows, fields) {
            if (err) {
                console.log ('Failed to execute query: ' + err.message);
            }
            else {
                var row = rows[0];
                if (row.status == 0)
                    callback (learnedDate, langCode);
            }
            connection.release();
        });
    });
}

function insertWord(learnedDate, langCode, word, confidence) {
    db.getConnection (function (err, connection) {
        if (err) {
            console.log ('Failed to get connection while inserting word: ' + err.message);
            return;
        }

        var q = 'insert into words_to_download (d, word, lang_code, confidence) values (?, ?, ?, ?)';
        connection.query (q, [learnedDate, word, langCode, confidence], function (err, results) {
            if (err) {
                console.log ('Failed to execute query: ' + err.message);
            }
            connection.release();
        });
    });
}

function pushWordsForClientsToDownload() {
    var learnedDate = helper.convertToYYYMMDD (helper.getYesterdaysDate());
    if (learnedDate == lastCheckedOn) {
        // We have pushed last days changes. Don't do anything
        return;
    }

    for (var i = 0; i < helper.supportedLangs.length; i++) {
        var langCode = helper.supportedLangs[i];
        pushWordsLearnedOn (learnedDate, langCode, function(d, langCode) {
            var db = new sqlite3.Database (helper.getLearningsFilePath(langCode));
            db.serialize(function() {
                var q = "select w.* from words w, patterns_content p where w.id = p.word_id "
                        + "and date(w.learned_on, 'unixepoch') = ? and p.learned = 1 group by w.word order by word";
                db.each(q, [d], function(err, row) {
                    if (err) {
                        console.log (err);
                        return;
                    }

                    insertWord (d, langCode, row.word, row.confidence);
                }, function(err, numberOfRows) {
                    if (numberOfRows > 0) {
                        console.log ("Words: " + numberOfRows + ", Learned date: " + learnedDate + ", Lang: " + langCode);
                    }
                    lastCheckedOn = learnedDate;
                });
            });
            db.close()
        });
    }
}

exports.startPushing = pushWordsForClientsToDownload;
