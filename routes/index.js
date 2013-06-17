var functions = require('../lib')

/*
 * GET home page.
 */

exports.index = function(req, res){
  	res.render('index', { title: 'Express' });
};

app.get('/editor', function(req, res) {
  	res.render('editor');
});

app.get('/supported_languages', functions.supported_languages);

// /tl?lang=code&text=text_to_transliterate
app.get('/tl', functions.tl);
app.get('/rtl', functions.rtl);
app.post('/learn', functions.learn);
