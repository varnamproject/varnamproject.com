// This job learns words reading from the queue

var db     = require('../lib/varnamdb').pool,
    helper = require('../lib/helpers.js');

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

        var q = 'select id, word, lang_code from words_to_learn order by word asc';
        connection.query (q, function (err, rows, fields) {
            if (err) {
                console.log ('Failed to execute query: ' + err.message);
            }
            else {
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    var handle = helper.getVarnamHandle (row.lang_code);
                    if (handle != undefined) {
                        handle.learn(row.word, function (err) {});
                    }
                    else {
                        console.log("Invalid handle: " + row.lang_code);
                    }

                    deleteWord (row.id);
                }
            }

            connection.release();
        });
    });
}

exports.startLearning = learnFromQueue;
