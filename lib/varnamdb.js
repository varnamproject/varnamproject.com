var mysql = require('mysql');
var mysqlHost = process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost';
var mysqlUser = process.env.OPENSHIFT_MYSQL_DB_USERNAME || 'root';
var mysqlDatabase = process.env.OPENSHIFT_MYSQL_DB_SCHEMA || 'varnam';

var pool = mysql.createPool({
    host: mysqlHost,
    user: mysqlUser,
    password: process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
    database: mysqlDatabase
});

exports.createSchema = function() {
    pool.getConnection (function (err, connection) {
        if (err) throw err;

        var q = 'create table if not exists words_to_learn '
                + '(id int not null auto_increment, word text, lang_code varchar(10), ip text, '
                + 'created_at timestamp default current_timestamp, primary key(id))';

        if (err) throw err;

        connection.query(q, function (err, rows, fields) {
            if (err) throw err;
            console.log("Initialized MySQL database");
            connection.release();
        });
    });
};

exports.pool = pool;
