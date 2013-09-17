var functions = require('../lib');
var helper = require('../lib/helpers.js');

app.get('/editor', function(req, res) {
  	res.render('editor');
});

app.get('/supported_languages', functions.supported_languages);

// /tl?lang=code&text=text_to_transliterate
app.get('/tl', functions.tl);
app.get('/rtl', functions.rtl);
app.post('/learn', functions.learn);
app.get('/words/:langCode/:year/:month/:date', functions.wordsToDownload);

app.get('/', function(req, res) {
  	res.render('index', { title: 'Varnam' });
});

app.get("*", function(req, res) {
    helper.render404(res);
});
