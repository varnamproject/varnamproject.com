// Handles BG activities

var v    = require('varnam'),
	path = require('path'),
    db   = require('./lib/varnamdb').pool;

var datadir = process.env.OPENSHIFT_DATA_DIR || ""
var handles = {
    ml: new v.Varnam("vst/ml-unicode.vst", path.join(datadir, "learnings.varnam.ml")),
    hi: new v.Varnam("vst/hi-unicode.vst", path.join(datadir, "learnings.varnam.hi")),
    gu: new v.Varnam("vst/gu-unicode.vst", path.join(datadir, "learnings.varnam.gu"))
};

function deleteWord(id) {
    db.getConnection (function (err, connection) {
        if (err) {
            console.log ('Failed to get connection to delete the word: ' + err.message);
            return;
        }

        var q = 'delete from words_to_learn where id = ?';
        connection.query (q, [id], function (err, result) {
            if (err) {
                console.log ('Failed to delete word: ' + id + '. ' + err.message);
            }

            connection.release();
        });
    });
}

function learnFromQueue() {
    db.getConnection (function (err, connection) {
        if (err) {
            console.log ('Failed to get connection: ' + err.message);
            return;
        }

        var q = 'select id, word, lang_code from words_to_learn';
        connection.query (q, function (err, rows, fields) {
            if (err) {
                console.log ('Failed to execute query: ' + err.message);
            }
            else {
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    var handle = handles[row.lang_code];
                    if (handle != undefined) {
                        handle.learn(row.word, function (err) {});
                    }

                    deleteWord (row.id);
                }
            }

            connection.release();
        });
    });
}

var jobs = [learnFromQueue]

function dispatcher() {
    for (var i = 0; i < jobs.length; i++) {
        var job = jobs[i];
        try {
            job();
        }
        catch (err) {
            console.log ("Exception occured." + err);
        }
    }
    setTimeout (dispatcher, 2000);
}

setTimeout (dispatcher, 2000);

