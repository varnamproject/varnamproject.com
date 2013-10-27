// This job learns words reading from the queue

var varnamdb = require('../lib/varnamdb'),
    db = varnamdb.pool,
    learnStatus = varnamdb.learnStatus,
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

function deleteOldRecords() {
    db.getConnection (function (err, connection) {
        if (err) {
            console.log ('Failed to get connection: ' + err.message);
            return;
        }

        var q = 'delete from words_to_learn where TIMESTAMPDIFF(HOUR,created_at,current_timestamp) > 0 and status = ?';
        connection.query (q, [learnStatus.Learned], function (err, result) {
            if (err) {
                console.log ('Failed to delete old records: ' + err.message);
            }

            connection.release();
        });
    });
}


function changeStatus(id, newStatus) {
    db.getConnection (function (err, connection) {
        if (err) {
            console.log ('Failed to get connection to change the word status: ' + err.message);
            return;
        }

        var q = 'update words_to_learn set status = ? where id = ?';
        connection.query (q, [newStatus, id], function (err, result) {
            if (err) {
                console.log ('Failed to change status for word: ' + id + '. ' + err.message);
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

        var q = 'select id, word, lang_code from words_to_learn where status = ? order by word asc';
        connection.query (q, [learnStatus.New], function (err, rows, fields) {
            if (err) {
                console.log ('Failed to execute query: ' + err.message);
            }
            else {
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    var handle = helper.getVarnamHandle (row.lang_code);
                    if (handle != undefined) {
                        var rowStatus = handle.isKnownWord(row.word) ? learnStatus.Learned : learnStatus.NeedsApproval;
                        handle.learn(row.word, function (err) {});
                        changeStatus(row.id, rowStatus);
                    }
                    else {
                        console.log("Invalid handle: " + row.lang_code);
                        deleteWord(row.id);
                    }
                }
            }

            connection.release();
        });
    });
}

exports.startLearning = learnFromQueue;
exports.deleteOldRecords = deleteOldRecords;
