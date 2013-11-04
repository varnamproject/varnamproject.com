var mysql = require('mysql');
var mysqlHost = process.env.VARNAM_DB_HOST || 'localhost';
var mysqlUser = process.env.VARNAM_DB_USERNAME || 'root';
var mysqlDatabase = process.env.VARNAM_DB_SCHEMA || 'varnam';

var pool = mysql.createPool({
    host: mysqlHost,
    user: mysqlUser,
    password: process.env.VARNAM_DB_PASSWORD,
    database: mysqlDatabase
});

function createLearnQueue() {
    pool.getConnection (function (err, connection) {
        if (err) throw err;

        var q = 'create table if not exists words_to_learn '
                + '(id int not null auto_increment, word varchar(50) character set utf8 not null, ' 
                + 'lang_code varchar(10), ip text, '
                + 'created_at timestamp default current_timestamp, primary key(id), unique (word))';

        connection.query(q, function (err, rows, fields) {
            if (err) throw err;
            console.log("MySQL: Created words_to_learn");
            connection.release();
        });
    });
}

function addStatusColumnToLearnQueue() {
    pool.getConnection (function (err, connection) {
        if (err) throw err;

        var q = 'alter table words_to_learn add column '
                + '(status int default 0)';

        connection.query(q, function (err, rows, fields) {
            if (err && err.toString().indexOf("ER_DUP_FIELDNAME") == -1) throw err;
            console.log("MySQL: Added status column to words_to_learn");
            connection.release();
        });
    });
}

function createWordsToDownload() {
    pool.getConnection (function (err, connection) {
        if (err) throw err;

        var q = ' create table if not exists words_to_download (d varchar(10) not null, word varchar(50) character set utf8 not null,'
                + 'lang_code varchar(5) not null, confidence int, unique (word));'

        if (err) throw err;

        connection.query(q, function (err, rows, fields) {
            if (err) throw err;
            console.log("MySQL: Created words_to_download");
            connection.release();
        });
    });
} 

exports.createSchema = function() {
    createLearnQueue();
    addStatusColumnToLearnQueue();
    createWordsToDownload();
};

exports.pool = pool;
exports.learnStatus = {New: 0, Learned: 1, NeedsApproval: 2};
