var functions = require('../lib');
var helper = require('../lib/helpers.js');

app.get('/editor', function(req, res) {
  	res.render('editor');
});

app.get('/supported_languages', functions.supported_languages);

app.get('/tl', function (req, res) {
    res.redirect("/api/tl/" + req.query.lang + "/" + req.query.text);
});
app.get('/rtl', function (req, res) {
    res.redirect("/api/rtl/" + req.query.lang + "/" + req.query.text);
});

app.post('/learn', functions.learn);
app.post('/api/learn', functions.learn);
app.get('/api/tl/:langCode/:word', functions.tl);
app.get('/api/rtl/:langCode/:word', functions.rtl);
app.get('/words/:langCode/:year/:month/:date', functions.wordsToDownload);

app.get('/', function(req, res) {
  	res.render('index', { title: 'Varnam' });
});

app.get('/downloads', function (req, res) {
	res.redirect("/docs/downloads");
});
app.get('/docs', functions.serveDocs);
app.get('/docs/*', functions.serveDocs);

app.get("*", function(req, res) {
    helper.render404(res);
});
